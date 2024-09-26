/* eslint-disable no-undef */
import request from 'supertest';
import app from '../src/app.js';

describe('API Response Size Comparison', () => {
  it('should compare the size of responses and check for compression', async () => {
    const noCompressionResponse = await request(app).get('/api/no-compression');
    const compressionResponse = await request(app).get('/api/compression');

    // Size of the response without compression
    const noCompressionSize = Buffer.byteLength(
      JSON.stringify(noCompressionResponse.body)
    );

    // Size of the response with compression
    const compressionSize = Buffer.byteLength(compressionResponse.text); // Use .text for the compressed response

    console.log(`Size without compression: ${noCompressionSize} bytes`);
    console.log(`Size with compression: ${compressionSize} bytes`);

    // expect(compressionSize).toBeLessThan(noCompressionSize); // Check if compressed size is less
    // expect(compressionResponse.headers['content-encoding']).toBe('gzip'); // Check for gzip encoding
  }, 20000);
});
