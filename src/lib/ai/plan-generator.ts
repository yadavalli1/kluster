import { openai } from '@ai-sdk/openai';
import { streamObject, generateObject, generateText, streamText } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const planSchema = z.object({
  name: z.string().describe('Name of the implementation plan'),
  overview: z.string().describe('High-level summary of the approach'),
  architecture: z.object({
    frontend: z.string(),
    backend: z.string(),
    database: z.string(),
    infrastructure: z.string(),
  }),
  tasks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
      estimatedHours: z.number(),
      dependencies: z.array(z.string()).optional(),
      acceptanceCriteria: z.array(z.string()),
    })
  ),
  dependencies: z.array(
    z.object({
      taskId: z.string(),
      dependsOn: z.array(z.string()),
    })
  ),
  risks: z.array(
    z.object({
      description: z.string(),
      mitigation: z.string(),
      severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    })
  ),
  timeline: z.object({
    totalHours: z.number(),
    phases: z.array(
      z.object({
        name: z.string(),
        duration: z.string(),
        tasks: z.array(z.string()),
      })
    ),
  }),
});

export type GeneratedPlan = z.infer<typeof planSchema>;

export async function generatePlanStream(specification: string) {
  const result = streamObject({
    model: openai('gpt-4-turbo-preview'),
    schema: planSchema,
    system: `You are a senior software architect and technical lead. Your task is to generate detailed implementation plans based on project specifications.

Guidelines:
1. Break work into discrete, well-defined tasks
2. Identify dependencies between tasks clearly
3. Estimate effort realistically (use hours, not days)
4. Consider edge cases and risks
5. Structure the database schema decisions
6. Plan the API endpoints needed
7. Consider deployment and DevOps requirements

Each task should have:
- Clear title and description
- Priority (CRITICAL for blockers, HIGH for core features, MEDIUM for enhancements, LOW for nice-to-have)
- Realistic hour estimates
- Specific acceptance criteria
- Dependencies on other tasks if any`,
    prompt: `Based on the following project specification, generate a comprehensive technical implementation plan:

${specification}

Provide a detailed plan including:
1. Architecture overview
2. Database schema
3. API design
4. Frontend components
5. Testing strategy
6. Deployment approach

Break all work into specific, actionable tasks with clear dependencies.`,
  });

  return result;
}

export async function generatePlan(specification: string): Promise<GeneratedPlan> {
  const result = await generateObject({
    model: openai('gpt-4-turbo-preview'),
    schema: planSchema,
    system: `You are a senior software architect and technical lead. Generate detailed implementation plans with specific, actionable tasks.`,
    prompt: `Generate a technical implementation plan for:

${specification}`,
  });

  return result.object;
}

export async function generateClarifyingQuestions(specification: string) {
  const result = await generateObject({
    model: openai('gpt-4-turbo-preview'),
    schema: z.object({
      questions: z.array(
        z.object({
          question: z.string(),
          category: z.enum(['TECHNICAL', 'BUSINESS', 'SECURITY', 'PERFORMANCE', 'UX']),
          importance: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
          context: z.string(),
        })
      ),
    }),
    system: `You are a technical requirements analyst. Based on the specification provided, identify gaps and ask clarifying questions.`,
    prompt: `Review this specification and identify what information is missing or needs clarification:

${specification}`,
  });

  return result.object.questions;
}

export async function savePlanToDatabase(
  projectId: string,
  plan: GeneratedPlan,
  version: number = 1
) {
  const savedPlan = await prisma.plan.create({
    data: {
      projectId,
      name: plan.name,
      version,
      status: 'DRAFT',
      content: plan as any,
      generatedBy: 'gpt-4-turbo-preview',
    },
  });

  // Create tasks from the plan
  const taskPromises = plan.tasks.map(async (task) => {
    return prisma.task.create({
      data: {
        projectId,
        planId: savedPlan.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        dependencies: task.dependencies || [],
        status: 'PENDING',
      },
    });
  });

  await Promise.all(taskPromises);

  return savedPlan;
}

export async function* streamPlanExplanation(plan: GeneratedPlan) {
  const prompt = `Explain this technical implementation plan in a clear, conversational way:

Plan: ${plan.name}
Overview: ${plan.overview}

Key Tasks:
${plan.tasks.map(t => `- ${t.title}: ${t.description}`).join('\n')}

Total estimated effort: ${plan.timeline.totalHours} hours

Provide a summary that explains:
1. What will be built
2. The approach being taken
3. Key phases of work
4. Any notable risks or considerations`;

  const result = streamText({
    model: openai('gpt-4-turbo-preview'),
    prompt,
  });

  for await (const chunk of result.textStream) {
    yield chunk;
  }
}
