import { Injectable } from '@nestjs/common';
import * as cloudinary from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class FilesService {
  uploadFile(dataBuffer: Buffer, filename: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let stream = cloudinary.v2.uploader.upload_stream(
        {
          public_id: filename,
        },
        (error, result) => {
          if (result) {
            resolve(result.secure_url);
          } else {
            reject(error);
          }
        },
      );

      streamifier.createReadStream(dataBuffer).pipe(stream);
    });
  }
}
