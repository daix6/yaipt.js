import { isNumber } from './Utils';

/**
 * 对 ImageData 的像素数组进行封装
 *
 */
class PixelArray {
  private pixelArray: Uint8ClampedArray;
  public width: number;
  public height: number;

  /**
   * ImageData.data
   */
  constructor(array: ImageData, width: number, height?: number);
  constructor(width: number, height: number);
  constructor(x?: any, y?: any, z?: any) {
    if (isNumber(x) && isNumber(y)) {
      this.pixelArray = new Uint8ClampedArray(x * y * 4);
      this.width = x;
      this.height = y;
    } else if (x && Object.prototype.toString.call(x) === '[object ImageData]' && isNumber(y)) {
      this.pixelArray = x.data;
      this.width = y;
      this.height = isNumber(z) ? z : this.pixelArray.length / (4 * y);
    } else {
      throw new Error('PixelArray constructor - 错误的参数类型');
    }
  }

  getPixel(row: number, col: number): number[] {
    let start = row * col * 4;
    if (start < 0 || start >= this.pixelArray.length) {
      throw new RangeError('PixelArray getPixel - 参数超过范围');
    }
    return [
      this.pixelArray[start],
      this.pixelArray[start + 1],
      this.pixelArray[start + 2],
      this.pixelArray[start + 3]
    ];
  }

  setPixel(row: number, col: number, pixel: number[]): void {
    let start = row * col * 4;

    if (start < 0 || start >= this.pixelArray.length) {
      throw new RangeError('PixelArray getPixel - 参数超过范围');
    }

    if (pixel.length != 4) {
      throw new Error('PixelArray setPixel - 错误的参数值');
    }

    this.pixelArray[start] = pixel[0];
    this.pixelArray[start + 1] = pixel[1];
    this.pixelArray[start + 2] = pixel[0];
    this.pixelArray[start + 3] = pixel[0];
  }

  /**
   * 生成 ImageData
   */
  generatImageData() {
    return new ImageData(this.pixelArray, this.width, this.height);
  }
}

export default PixelArray;
