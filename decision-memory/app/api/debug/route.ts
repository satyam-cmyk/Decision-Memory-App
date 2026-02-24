import { decisionRepository, reviewRepository } from '@/lib';

export async function GET() {
  try {
    const decisions = await decisionRepository.getAll();
    const reviews = await reviewRepository.getAll();

    return Response.json({
      success: true,
      data: {
        decisions,
        reviews,
        summary: {
          total_decisions: decisions.length,
          total_reviews: reviews.length,
        },
      },
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
