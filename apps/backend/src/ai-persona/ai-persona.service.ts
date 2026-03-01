import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface PersonaStyle {
  focusAreas?: string[];
  tone?: string;
  language?: string;
}

export const BUILT_IN_PERSONAS = [
  {
    id: 'builtin-simple',
    name: 'Dr. Simple',
    style: 'simple',
    preferences: {
      tone: 'friendly',
      focusAreas: ['plain-language', 'key-takeaways'],
      language: 'en',
    },
    isBuiltIn: true,
    description: 'Explains like talking to a friend',
    emoji: '😊',
  },
  {
    id: 'builtin-detail',
    name: 'Dr. Detail',
    style: 'detailed',
    preferences: {
      tone: 'professional',
      focusAreas: ['medical-analysis', 'reference-ranges', 'trends'],
      language: 'en',
    },
    isBuiltIn: true,
    description: 'Comprehensive medical analysis',
    emoji: '🔬',
  },
  {
    id: 'builtin-diet',
    name: 'Diet Coach',
    style: 'diet-focused',
    preferences: {
      tone: 'encouraging',
      focusAreas: ['nutrition', 'local-foods', 'meal-planning'],
      language: 'en',
    },
    isBuiltIn: true,
    description: 'Focuses on nutrition and local foods',
    emoji: '🥗',
  },
  {
    id: 'builtin-guardian',
    name: 'Health Guardian',
    style: 'concern-focused',
    preferences: {
      tone: 'cautious',
      focusAreas: ['urgency', 'critical-values', 'doctor-consultation'],
      language: 'en',
    },
    isBuiltIn: true,
    description: 'Emphasizes concerns and urgency',
    emoji: '🛡️',
  },
];

@Injectable()
export class AiPersonaService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const custom = await this.prisma.aiPersona.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return {
      builtIn: BUILT_IN_PERSONAS,
      custom: custom.map((p) => ({
        ...p,
        isBuiltIn: false,
        emoji: '🤖',
        description: `Custom ${p.style} persona`,
      })),
    };
  }

  async create(
    userId: string,
    data: { name: string; style: string; preferences: PersonaStyle },
  ) {
    return this.prisma.aiPersona.create({
      data: {
        userId,
        name: data.name,
        style: data.style,
        preferences: data.preferences as any,
      },
    });
  }

  async update(
    userId: string,
    id: string,
    data: { name?: string; style?: string; preferences?: PersonaStyle },
  ) {
    const persona = await this.prisma.aiPersona.findFirst({
      where: { id, userId },
    });
    if (!persona) throw new NotFoundException('Persona not found');

    return this.prisma.aiPersona.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.style && { style: data.style }),
        ...(data.preferences && { preferences: data.preferences as any }),
      },
    });
  }

  async delete(userId: string, id: string) {
    const persona = await this.prisma.aiPersona.findFirst({
      where: { id, userId },
    });
    if (!persona) throw new NotFoundException('Persona not found');

    await this.prisma.aiPersona.delete({ where: { id } });
    return { message: 'Persona deleted' };
  }

  getPromptModifier(
    style: string,
    preferences: PersonaStyle,
  ): string {
    const modifiers: Record<string, string> = {
      simple:
        'Explain in very simple, friendly language as if talking to a close friend. Avoid medical jargon. Use analogies and everyday language.',
      detailed:
        'Provide a thorough, professional medical analysis. Include detailed explanations of each value, reference range significance, and clinical correlations.',
      'diet-focused':
        'Focus primarily on dietary and nutritional recommendations. Suggest specific local Bangladeshi foods. Include meal planning ideas and foods to avoid.',
      'concern-focused':
        'Prioritize identifying any concerning values. Clearly flag urgency levels. Strongly recommend doctor consultation for any abnormal values. Be cautious in tone.',
    };

    let prompt = modifiers[style] || modifiers.simple;

    if (preferences.tone === 'encouraging') {
      prompt += ' Use an encouraging, supportive tone.';
    }
    if (preferences.focusAreas?.includes('trends')) {
      prompt += ' Pay special attention to trends and changes over time.';
    }

    return prompt;
  }
}
