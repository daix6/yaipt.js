import PixelArray from './PixelArray';

export default class Yaipt {
  public width: number;
  public height: number;
  public colorSpace: string;
  // public originImageData: ImageData;
  public pixels: PixelArray;

  /**
   * Yaipt 的构造函数
   * @param {ImageData} imageData
   */
  constructor(imageData: ImageData) {
    this.width = imageData.width;
    this.height = imageData.height;
    this.colorSpace = 'RGB';
    // this.originImageData = imageData;
    this.pixels = new PixelArray(imageData, this.width, this.height);
  }

  /**
   * 遍历，逐一对单个像素进行处理，只允许对单个像素操作，否则可能无法达到预期效果。
   *
   * @param {String} colorSpace 处理所需的色彩空间
   * @param {(number[], number, number) => number[]} processor 处理函数
   */
  iterate(colorSpace: string, processor: (pixel: number[], row: number, col: number) => number[], onSelf: boolean = true): Yaipt {
    if (this.colorSpace.toUpperCase() != colorSpace.toUpperCase()) {
      throw Error('当前色彩空间与处理所需色彩空间不同');
    }

    let copy = this.pixels;
    if (!onSelf) copy = new PixelArray(this.width, this.height);

    for (let row = 0; row < this.width; row++) {
      for (let col = 0; col < this.height; col++) {
        this.pixels.setPixel(row, col, processor(this.pixels.getPixel(row, col), row, col));
      }
    }

    return onSelf ? this : new Yaipt(copy.generatImageData());
  }

  /**
   * 在 RGB 色彩空间下获取红色通道图像
   *
   * @param {boolean} onSelf 是否对当前实例操作
   */
  beRed(onSelf?: boolean): Yaipt {
    if (this.colorSpace != 'RGB') {
      throw Error('Yaipt.prototype.beRed - 不支持的色彩空间');
    }

    return this.iterate('RGB', (pixel, row, col) => {
      return [pixel[0], 0, 0, pixel[3]];
    }, !!onSelf);
  }

  /**
   * 在 RGB 色彩空间下获取绿色通道图像
   *
   * @param {boolean} onSelf 是否对当前实例操作
   */
  beGreen(onSelf?: boolean): Yaipt {
    if (this.colorSpace != 'RGB') {
      throw Error('Yaipt.prototype.beGreen - 不支持的色彩空间');
    }

    return this.iterate('RGB', (pixel, row, col) => {
      return [0, pixel[1], 0, pixel[3]];
    }, !!onSelf);
  }

  /**
   * 在 RGB 色彩空间下获取蓝色通道图像
   *
   * @param {boolean} onSelf 是否对当前实例操作
   */
  beBlue(onSelf?: boolean): Yaipt {
    if (this.colorSpace != 'RGB') {
      throw Error('Yaipt.prototype.beBlue - 不支持的色彩空间');
    }

    return this.iterate('RGB', (pixel, row, col) => {
      return [0, 0, pixel[2], pixel[3]];
    }, !!onSelf);
  }

  /**
   * 在 RGB 色彩空间下获取灰度图像
   *
   * @param {boolean} onSelf 是否对当前实例操作
   */
  beGray(onSelf?: boolean): Yaipt {
    if (this.colorSpace != 'RGB') {
      throw Error('Yaipt.prototype.beGray - 不支持的色彩空间');
    }

    return this.iterate('RGB', (pixel, row, col) => {
      let intensity = pixel[0] * .2126 + pixel[1] * .7152 + pixel[2] * .0722;
      return [intensity, intensity, intensity, pixel[3]];
    }, !!onSelf);
  }
};
