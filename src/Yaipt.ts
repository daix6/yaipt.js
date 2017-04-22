import { Promise } from 'es6-promise';
import { isObject } from './Utils'
import PixelArray from './PixelArray';

export default class Yaipt {
  public width: number;
  public height: number;
  public colorSpace: string;
  // public originImageData: ImageData;
  public pixels: PixelArray;

  public static __canvas = document.createElement('canvas');
  public static __canvasContext = Yaipt.__canvas.getContext('2d');

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

  show(image: HTMLImageElement, offsetRow?: number, offsetCol?: number, width?: number, height?: number);
  show(canvas: HTMLCanvasElement, offsetRow?: number, offsetCol?: number, width?: number, height?: number, toRow?: number, toCol?: number);
  show(to: any, offsetRow?: number, offsetCol?: number, width?: number, height?: number, toRow?: number, toCol?: number): void {
    offsetRow = offsetRow || 0;
    offsetCol = offsetCol || 0;
    width = width || (this.width - offsetCol);
    height = height || (this.height - offsetRow);
    toRow = toRow || 0;
    toCol = toCol || 0;

    if (isObject(to)) {
      if (to instanceof HTMLImageElement) {
        Yaipt.__canvas.width = width || this.width;
        Yaipt.__canvas.height = height || this.height;

        Yaipt.__canvasContext.putImageData(
          this.pixels.generatImageData(offsetRow, offsetCol, width, height), 0, 0, width, height
        );

        to.src = Yaipt.__canvas.toDataURL();
      } else if (to instanceof HTMLCanvasElement) {
        let context = to.getContext('2d');
        context.clearRect(toCol, toRow, width, height);
        context.putImageData(
          this.pixels.generatImageData(offsetRow, offsetCol, width, height), 0, 0, toCol, toRow, width, height
        );
        debugger;
      } else {
        throw new Error('Yaipt.prototype.show 错误的参数类型');
      }
    } else {
      throw new Error('Yaipt.prototype.show 错误的参数类型');
    }
  }

  static setImage(image: HTMLImageElement);
  static setImage(link: string);
  static setImage(src: any) {
    return new Promise<Yaipt>(function (resolve, reject) {
      if (typeof src === 'string') {
        let image = new Image();
        image.crossOrigin = 'Anonymous';

        image.addEventListener('load', () => {
          Yaipt.__canvas = document.createElement('canvas');
          Yaipt.__canvasContext = Yaipt.__canvas.getContext('2d');
          Yaipt.__canvas.width = image.width;
          Yaipt.__canvas.height = image.height;

          Yaipt.__canvasContext.drawImage(image, 0, 0, image.width, image.height);

          try {
            resolve(new Yaipt(Yaipt.__canvasContext.getImageData(0, 0, image.width, image.height)));
          } catch (e) {
            reject(e);
            console.error('Yaipt.setImage：错误的图片地址', e);
          }
        }, false);

        image.src = src;
      } else if (typeof src === 'object' && src instanceof HTMLImageElement) {
        Yaipt.__canvas = document.createElement('canvas');
        Yaipt.__canvasContext = Yaipt.__canvas.getContext('2d');
        Yaipt.__canvas.width = src.width;
        Yaipt.__canvas.height = src.height;

        Yaipt.__canvasContext.drawImage(src, 0, 0, src.width, src.height)
        ;

        setTimeout(function () {
          resolve(new Yaipt(Yaipt.__canvasContext.getImageData(0, 0, src.width, src.height)));
        });
      } else {
        reject('Yaipt.setImage：错误的参数格式');
      }
    });
  }
};

(<any>window).Yaipt = Yaipt;
