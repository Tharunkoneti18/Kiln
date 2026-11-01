import { NextRequest, NextResponse } from 'next/server';
import { apiError, ApiErrorCode } from '@/src/lib/api/errors';
import { processProfileImport } from '@/src/lib/career/profile-service';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let text = '';
    let userId = 'anonymous_user';
    let fileName = 'resume.txt';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');
      const userIdField = formData.get('user_id');
      const textField = formData.get('text');

      if (userIdField && typeof userIdField === 'string') {
        userId = userIdField;
      }

      if (textField && typeof textField === 'string' && textField.trim()) {
        text = textField;
      }

      if (file && typeof file === 'object' && 'arrayBuffer' in file) {
        const fileObj = file as File;
        fileName = fileObj.name || fileName;
        const arrayBuffer = await fileObj.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const lowerName = fileName.toLowerCase();
        if (lowerName.endsWith('.pdf')) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const pdfParse = require('pdf-parse');
            const parsedPdf = await pdfParse(buffer);
            text = parsedPdf.text || text;
          } catch (pdfErr: any) {
            console.warn('PDF parse fallback to text decoding:', pdfErr?.message);
            text = buffer.toString('utf-8');
          }
        } else if (lowerName.endsWith('.docx')) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const mammoth = require('mammoth');
            const docxResult = await mammoth.extractRawText({ buffer });
            text = docxResult.value || text;
          } catch (docxErr: any) {
            console.warn('DOCX parse fallback to text decoding:', docxErr?.message);
            text = buffer.toString('utf-8');
          }
        } else {
          // Standard text, md, json, or utf-8 files
          text = buffer.toString('utf-8');
        }
      }
    } else {
      const body = await req.json();
      text = body.text || '';
      userId = body.user_id || userId;
      fileName = body.file_name || fileName;
    }

    if (!text || typeof text !== 'string' || !text.trim()) {
      return apiError(
        ApiErrorCode.UNPROCESSABLE_ENTITY,
        'Text or file content is required for profile import',
        422
      );
    }

    const result = await processProfileImport(userId, text);

    return NextResponse.json({
      ...result,
      file_name: fileName,
    });
  } catch (error: any) {
    return apiError(
      ApiErrorCode.INTERNAL_ERROR,
      error?.message || 'Failed to process resume import',
      500
    );
  }
}

