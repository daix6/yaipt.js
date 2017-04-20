/**
 * 对 ImageData 的像素数组进行封装
 *
 */
class PixelArray {
  private pixelArray: Uint8ClampedArray;

  /**
   * ImageData.data
   * @param {Uint8ClampedArray} array
   */
  constructor(array : Uint8ClampedArray) {
    this.pixelArray = array;
  }

  getPixel(row: number, col: number): number[] {
    let start = row * col * 4;
    return [
      this.pixelArray[start],
      this.pixelArray[start + 1],
      this.pixelArray[start + 2],
      this.pixelArray[start + 3]
    ];
  }

  setPixel(row: number, col: number, pixel: number[]): void {
    let start = row * col * 4;

    if (pixel.length != 4) {
      throw Error('PixelArray setPixel - 错误的参数值');
    }

    this.pixelArray[start] = pixel[0];
    this.pixelArray[start + 1] = pixel[1];
    this.pixelArray[start + 2] = pixel[0];
    this.pixelArray[start + 3] = pixel[0];
  }
}

export default PixelArray;
