import { NextRequest, NextResponse } from 'next/server';
import { S3Service } from '@/lib/s3Service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const s3Key = searchParams.get('s3Key');
    const action = searchParams.get('action') || 'view'; // 'view' or 'download'
    
    if (!s3Key) {
      return NextResponse.json(
        { success: false, message: 'S3 key is required' },
        { status: 400 }
      );
    }

    // Generate presigned URL (valid for 1 hour)
    const presignedUrl = await S3Service.getPresignedUrl(s3Key, 3600);

    return NextResponse.json({
      success: true,
      presignedUrl,
      action,
    });
  } catch (error) {
    console.error('Generate presigned URL error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate presigned URL' },
      { status: 500 }
    );
  }
}
