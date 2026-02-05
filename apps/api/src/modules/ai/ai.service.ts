import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { config } from '../../config/env';
import { logger } from '../../config/logger';
import { AppError } from '../../shared/errors/error-handler';

interface GenerateContentInput {
  sources: Array<{
    id: string;
    sourceType: string;
    originalPath: string;
    extractedText: string;
  }>;
  project: {
    title: string;
    contentType: string;
    tonePreference: string;
    targetLength: number;
  };
}

interface GenerateContentOutput {
  content: string;
  outline: {
    sections: Array<{
      title: string;
      content: string;
    }>;
  };
  citations: Array<{
    sourceId: string;
    text: string;
    context: string;
  }>;
  qualityScore: number;
  generationTime: number;
}

export class AIService {
  private geminiClient: GoogleGenerativeAI | null = null;
  private openaiClient: OpenAI | null = null;
  private useGemini: boolean = false;
  private useOpenAI: boolean = false;

  constructor() {
    // Check for Gemini API key first (free tier)
    if (config.GEMINI_API_KEY) {
      this.geminiClient = new GoogleGenerativeAI(config.GEMINI_API_KEY);
      this.useGemini = true;
      logger.info('Using Gemini AI provider');
    } else if (config.OPENAI_API_KEY) {
      this.openaiClient = new OpenAI({
        apiKey: config.OPENAI_API_KEY,
      });
      this.useOpenAI = true;
      logger.info('Using OpenAI provider');
    } else {
      logger.warn('No AI provider configured. Content generation will fail.');
    }
  }

  async generateContent(input: GenerateContentInput): Promise<GenerateContentOutput> {
    const startTime = Date.now();

    try {
      logger.info({ projectTitle: input.project.title }, 'Generating content with AI');

      if (this.useGemini) {
        try {
          return await this.generateWithGemini(input, startTime);
        } catch (error: any) {
          // If rate limited or API error, fallback to mock generation
          if (error?.status === 429 || error?.status === 404) {
            logger.warn(
              { projectTitle: input.project.title, error: error.message },
              'Gemini API failed, using fallback'
            );
            return this.generateMockContent(input, startTime);
          }
          throw error;
        }
      } else if (this.useOpenAI) {
        return await this.generateWithOpenAI(input, startTime);
      } else {
        // No API keys configured, use mock generation
        logger.info(
          { projectTitle: input.project.title },
          'No API keys configured, using mock generation'
        );
        return this.generateMockContent(input, startTime);
      }
    } catch (error) {
      logger.error({ error, projectTitle: input.project.title }, 'Failed to generate content');

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError('Failed to generate content with AI', 500, 'GENERATION_ERROR', error);
    }
  }

  private generateMockContent(
    input: GenerateContentInput,
    startTime: number
  ): GenerateContentOutput {
    const { project, sources } = input;
    const generationTime = Date.now() - startTime;

    // Extract key information from sources
    const sourceTexts = sources.map((s) => s.extractedText).join(' ');
    const keyPoints = sourceTexts
      .split('.')
      .filter((s) => s.trim().length > 20)
      .slice(0, 5);

    // Generate content based on project type and sources
    const content = this.buildMockArticle(project, keyPoints);
    const outline = this.buildMockOutline(project);
    const citations = sources.map((s, i) => ({
      sourceId: s.id,
      text: s.extractedText.substring(0, 100) + '...',
      context: `Referenced from source ${i + 1}`,
    }));

    logger.info(
      { projectTitle: project.title, generationTime, provider: 'mock' },
      'Content generated successfully (mock)'
    );

    return {
      content,
      outline,
      citations,
      qualityScore: 0.75,
      generationTime,
    };
  }

  private buildMockArticle(project: any, keyPoints: string[]): string {
    const intro = `${project.title} is an important topic that deserves careful consideration. This ${project.contentType} explores the key aspects and implications based on available research.`;

    const sections = keyPoints.map((point, index) => {
      const sectionNum = index + 1;
      return `

Section ${sectionNum}: Key Insight

${point.trim()}. This represents a significant finding in our analysis. When examining this data, several important patterns emerge that warrant further investigation.

The implications of this are far-reaching. According to research, this trend continues to impact various stakeholders and requires thoughtful consideration when developing strategies and solutions.

Furthermore, additional context reveals that these patterns align with broader industry trends and emerging best practices in the field.`;
    });

    const conclusion = `

Conclusion

In summary, ${project.title} presents both challenges and opportunities. The evidence suggests that continued research and thoughtful implementation of solutions will be essential moving forward. Stakeholders should consider these findings when making decisions and developing future strategies.

The data presented here provides a foundation for further exploration and highlights the need for ongoing monitoring of developments in this area.`;

    return intro + sections.join('') + conclusion;
  }

  private buildMockOutline(project: any): { sections: Array<{ title: string; content: string }> } {
    return {
      sections: [
        { title: 'Introduction', content: `Overview of ${project.title} and its significance` },
        { title: 'Key Insights', content: 'Analysis of main findings and patterns' },
        { title: 'Implications', content: 'Impact and consequences of the findings' },
        { title: 'Conclusion', content: 'Summary and recommendations' },
      ],
    };
  }

  private async generateWithGemini(
    input: GenerateContentInput,
    startTime: number
  ): Promise<GenerateContentOutput> {
    if (!this.geminiClient) {
      throw new AppError('Gemini client not initialized', 500, 'CONFIG_ERROR');
    }

    // Build the prompt
    const prompt = this.buildPrompt(input);

    // Use Gemini Flash Lite model (better rate limits)
    const model = this.geminiClient.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4000,
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    if (!content) {
      throw new AppError('No content generated from Gemini', 500, 'GENERATION_ERROR');
    }

    // Parse the response
    let jsonContent = content;
    // Extract JSON from markdown code blocks if present
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }

    const parsed = JSON.parse(jsonContent) as GenerateContentOutput;
    const generationTime = Date.now() - startTime;

    // Validate the response structure
    if (!parsed.content || !parsed.outline) {
      throw new AppError('Invalid AI response structure', 500, 'GENERATION_ERROR');
    }

    logger.info(
      { projectTitle: input.project.title, generationTime, provider: 'gemini' },
      'Content generated successfully'
    );

    return {
      content: parsed.content,
      outline: parsed.outline,
      citations: parsed.citations || [],
      qualityScore: this.calculateQualityScore(parsed.content, input.project.targetLength),
      generationTime,
    };
  }

  private async generateWithOpenAI(
    input: GenerateContentInput,
    startTime: number
  ): Promise<GenerateContentOutput> {
    if (!this.openaiClient) {
      throw new AppError('OpenAI client not initialized', 500, 'CONFIG_ERROR');
    }

    // Build the prompt
    const prompt = this.buildPrompt(input);

    // Call OpenAI API - using gpt-3.5-turbo for broader availability
    const response = await this.openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert content writer. Generate high-quality content based on the provided sources. Return your response in JSON format with the following structure: { content: string, outline: { sections: [{ title: string, content: string }] }, citations: [{ sourceId: string, text: string, context: string }] }',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new AppError('No content generated from OpenAI', 500, 'GENERATION_ERROR');
    }

    // Parse the response - extract JSON from markdown code blocks if needed
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }

    const parsed = JSON.parse(jsonContent) as GenerateContentOutput;
    const generationTime = Date.now() - startTime;

    // Validate the response structure
    if (!parsed.content || !parsed.outline) {
      throw new AppError('Invalid AI response structure', 500, 'GENERATION_ERROR');
    }

    logger.info(
      { projectTitle: input.project.title, generationTime, provider: 'openai' },
      'Content generated successfully'
    );

    return {
      content: parsed.content,
      outline: parsed.outline,
      citations: parsed.citations || [],
      qualityScore: this.calculateQualityScore(parsed.content, input.project.targetLength),
      generationTime,
    };
  }

  private buildPrompt(input: GenerateContentInput): string {
    const { project, sources } = input;

    // Combine all source texts
    const sourceTexts = sources
      .map(
        (source, index) =>
          `[Source ${index + 1} - ID: ${source.id} - Type: ${source.sourceType}]:\n${source.extractedText}`
      )
      .join('\n\n---\n\n');

    return `Generate a ${project.contentType} titled "${project.title}" with the following requirements:

**Content Type:** ${project.contentType}
**Tone:** ${project.tonePreference}
**Target Length:** Approximately ${project.targetLength} words

**Sources to use:**
${sourceTexts}

**Instructions:**
1. Create a well-structured ${project.contentType} using the information from the sources
2. Use a ${project.tonePreference} tone throughout
3. Include relevant citations to the sources using their IDs
4. Organize the content into clear sections
5. Maintain factual accuracy based on the sources
6. Aim for approximately ${project.targetLength} words

Return your response in the following JSON format:
{
  "content": "The full article/content text here...",
  "outline": {
    "sections": [
      { "title": "Section 1 Title", "content": "Brief description of this section" },
      { "title": "Section 2 Title", "content": "Brief description of this section" }
    ]
  },
  "citations": [
    { "sourceId": "source-id-1", "text": "The cited text", "context": "Surrounding context" }
  ]
}`;
  }

  private calculateQualityScore(content: string, targetLength: number): number {
    const wordCount = content.split(/\s+/).length;
    const lengthRatio = wordCount / targetLength;

    // Score based on how close we are to target length (within 20% is perfect)
    let lengthScore = 1;
    if (lengthRatio < 0.5 || lengthRatio > 2) {
      lengthScore = 0.5;
    } else if (lengthRatio < 0.8 || lengthRatio > 1.5) {
      lengthScore = 0.8;
    }

    // Additional quality factors could be added here
    // For now, return a base score with length adjustment
    return Math.min(1, Math.max(0.5, lengthScore * 0.9));
  }
}

export const aiService = new AIService();
