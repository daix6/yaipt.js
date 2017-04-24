import { Promise } from 'es6-promise';
import { isObject, isUndefined, isNumber } from './Utils'
import PixelArray from './PixelArray';

export default class Yaipt {
  public width: number;
  public height: number;
  public colorSpace: string;
  // public originImageData: ImageData;
  public pixels: PixelArray;

  public static __canvas = document.createElement('canvas');
  public static __canvasContext = Yaipt.__canvas.getContext('2d');

  // Gray Type
  public static GRAYSCALE = {
    LUMINANCE: 0, // CIE 1931 Linear Luminance
    AVERAGE: 1,   // (R + G + B) / 3
    LUMA: 2,      // rec601 luma(Y')
    RANDOM: 3,    // Random Grayscale
    CUSTOM: 4
  };

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
   * @param {(number[], number, number) => number[]} processor 对单个像素的处理函数
   */
  iterate(colorSpace: string, processor: (pixel: number[], row: number, col: number) => number[], onSelf: boolean = true): Yaipt {
    if (this.colorSpace.toUpperCase() != colorSpace.toUpperCase()) {
      throw new Error('当前色彩空间与处理所需色彩空间不同');
    }

    let copy = this.pixels, replacePixel;
    if (!onSelf) copy = new PixelArray(this.width, this.height);

    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        replacePixel = processor(this.pixels.getPixel(row, col), row, col);
        if (replacePixel < 0) replacePixel = 0;
        else if (replacePixel > 255) replacePixel = 255;
        copy.setPixel(row, col, replacePixel);
      }
    }

    return onSelf ? this : new Yaipt(copy.generatImageData());
  }

  /**
   * 在 RGB 色彩空间下获取红色通道图像
   *
   * @param {boolean} onSelf 是否对当前实例操作，false 则返回一个新的实例
   */
  beRed(onSelf: boolean = true): Yaipt {
    if (this.colorSpace != 'RGB') {
      throw new Error('Yaipt.prototype.beRed - 不支持的色彩空间');
    }

    return this.iterate('RGB', (pixel, row, col) => {
      return [pixel[0], 0, 0, pixel[3]];
    }, !!onSelf);
  }

  /**
   * 在 RGB 色彩空间下获取绿色通道图像
   *
   * @param {boolean} onSelf 是否对当前实例操作，false 则返回一个新的实例
   */
  beGreen(onSelf: boolean = true): Yaipt {
    if (this.colorSpace != 'RGB') {
      throw new Error('Yaipt.prototype.beGreen - 不支持的色彩空间');
    }

    return this.iterate('RGB', (pixel, row, col) => {
      return [0, pixel[1], 0, pixel[3]];
    }, !!onSelf);
  }

  /**
   * 在 RGB 色彩空间下获取蓝色通道图像
   *
   * @param {boolean} onSelf 是否对当前实例操作，false 则返回一个新的实例
   */
  beBlue(onSelf: boolean = true): Yaipt {
    if (this.colorSpace != 'RGB') {
      throw new Error('Yaipt.prototype.beBlue - 不支持的色彩空间');
    }

    return this.iterate('RGB', (pixel, row, col) => {
      return [0, 0, pixel[2], pixel[3]];
    }, !!onSelf);
  }

  /**
   * 在 RGB 色彩空间下获取灰度图像
   *
   * @param {boolean} type 灰度类型，默认为 CIE 1931 linear luminance
   * @param {number}  R R 通道权重
   * @param {number}  G G 通道权重
   * @param {number}  B B 通道权重
   * @param {boolean} onSelf 是否对当前实例操作，false 则返回一个新的实例
   */
  beGray(type: number = Yaipt.GRAYSCALE.LUMINANCE, R?: number, G?: number, B?: number, onSelf: boolean = true): Yaipt {
    if (this.colorSpace != 'RGB') {
      throw new Error('Yaipt.prototype.beGray - 不支持的色彩空间');
    }

    switch (type) {
      case Yaipt.GRAYSCALE.LUMA:
        R = .299, G = .587, B = .114;
        break;
      case Yaipt.GRAYSCALE.AVERAGE:
        R = G = B = 1/3;
        break;
      case Yaipt.GRAYSCALE.RANDOM:
        R = Math.random(), G = Math.random() * (1 - R), B = 1 - R - G;
        break;
      case Yaipt.GRAYSCALE.CUSTOM:
        if (isUndefined(R) || isUndefined(G) || isUndefined(B)) throw new Error('Yaipt.prototype.beGray CUSTOM 模式下缺少 R / G / B 参数');
        break;
      default:
        R = .2126, G = .7152, B = .0722;
    }

    return this.iterate('RGB', (pixel, row, col) => {
      let intensity = R * pixel[0] + G * pixel[1] + B * pixel[2];
      return [intensity, intensity, intensity, pixel[3]];
    }, !!onSelf);
  }

  /**
   * 获取复古图像（Sepia）
   *
   * @param {boolean} onSelf 是否对当前实例操作，false 则返回一个新的实例
   * @param {boolean} type 灰度类型，默认为 CIE 1931 linear luminance
   */
  beSepia(onSelf: boolean = true): Yaipt {
    if (this.colorSpace != 'RGB') {
      throw new Error('Yaipt.prototype.beGray - 不支持的色彩空间');
    }

    return this.iterate('RGB', (pixel, row, col) => {
      let R = .393 * pixel[0] + .769 * pixel[1] + .189 * pixel[2],
          G = .349 * pixel[0] + .686 * pixel[1] + .168 * pixel[2],
          B = .272 * pixel[0] + .534 * pixel[1] + .131 * pixel[2];
      return [R, G, B, pixel[3]];
    }, !!onSelf);
  }

  /**
   * 获取负片
   *
   * @param {boolean} onSelf 是否对当前实例操作，false 则返回一个新的实例
   * @param {boolean} type 灰度类型，默认为 CIE 1931 linear luminance
   */
  beInvert(onSelf: boolean = true): Yaipt {
    if (this.colorSpace != 'RGB') {
      throw new Error('Yaipt.prototype.beGray - 不支持的色彩空间');
    }

    return this.iterate('RGB', (pixel, row, col) => {
      return [255 - pixel[0], 255 - pixel[1], 255 - pixel[2], pixel[3]];
    }, !!onSelf);
  }

  /**
   * 对图片对比度与亮度进行处理
   *
   * @param {boolean} linear 对比度是否为线性调整
   * @param {number}  contrast 对比度增强程度（线性模型下取值范围为：[0, +∞)；非线性模型：[-255, 255])
   * @param {number}  brightness 亮度增强值（[-255, 255]）
   * @param {boolean} onSelf 是否对当前实例操作，false 则返回一个新的实例
   */
  adjustBrightnessAndContrast(linear: boolean = false, contrast: number, brightness: number = 0, onSelf: boolean = true): Yaipt {
    if (this.colorSpace != 'RGB') {
      throw new Error('Yaipt.prototype.beGray - 不支持的色彩空间');
    }

    let processor;

    if (linear) {
      contrast = isNumber(contrast) ? contrast : 1;
      processor = function(pixel) {
        let R = pixel[0] * contrast + brightness,
            G = pixel[1] * contrast + brightness,
            B = pixel[2] * contrast + brightness;

        return [R, G, B, pixel[3]];
      }
    } else {
      contrast = isNumber(contrast) ? contrast : 0;
      processor = function(pixel) {
        let threshold = .2126 * pixel[0] + .7152 * pixel[1] + .0722 * pixel[2];
        let R = pixel[0], G = pixel[1], B = pixel[2]  ;

        if (contrast >= 0) {
          R += brightness, G += brightness, B += brightness;
          if (contrast >= 255) {
            R = R >= threshold ? 255 : 0;
            G = G >= threshold ? 255 : 0;
            G = G >= threshold ? 255 : 0;
          } else {
            R = R + (R - threshold) * (1 / (1 - contrast / 255) - 1);
            G = G + (G - threshold) * (1 / (1 - contrast / 255) - 1);
            B = B + (B - threshold) * (1 / (1 - contrast / 255) - 1);
          }
        } else {
          if (contrast <= -255) R = G = B = threshold;
          else {
            R = R + (R - threshold) * contrast / 255;
            G = G + (G - threshold) * contrast / 255;
            B = B + (B - threshold) * contrast / 255;
          }
          R += brightness, G += brightness, B += brightness;
        }
        return [R, G, B, pixel[3]];
      }
    }

    return this.iterate('RGB', processor, !!onSelf);
  }

  /**
   * 图像对比度操作
   *
   * @param {boolean} linear 对比度是否为线性调整
   * @param {number}  contrast 对比度增强程度（线性模型下取值范围为：[0, +∞)；非线性模型：[-255, 255])
   * @param {boolean} onSelf 是否对当前实例操作，false 则返回一个新的实例
   */
  contrast(linear: boolean = false, contrast: number, onSelf: boolean = true): Yaipt {
    if (this.colorSpace != 'RGB') {
      throw new Error('Yaipt.prototype.beGray - 不支持的色彩空间');
    }

    return this.iterate('RGB', pixel => {
      if (linear) {
        return [pixel[0] * contrast, pixel[1] * contrast, pixel[2] * contrast, pixel[3]];
      } else {
        let threshold = .2126 * pixel[0] + .7152 * pixel[1] + .0722 * pixel[2];
        let R = pixel[0], G = pixel[1], B = pixel[2];
        if (contrast >= 0) {
          if (contrast >= 255) {
            R = R >= threshold ? 255 : 0;
            G = G >= threshold ? 255 : 0;
            G = G >= threshold ? 255 : 0;
          } else {
            R = R + (R - threshold) * (1 / (1 - contrast / 255) - 1);
            G = G + (G - threshold) * (1 / (1 - contrast / 255) - 1);
            B = B + (B - threshold) * (1 / (1 - contrast / 255) - 1);
          }
        } else {
          if (contrast <= -255) R = G = B = threshold;
          else {
            R = R + (R - threshold) * contrast / 255;
            G = G + (G - threshold) * contrast / 255;
            B = B + (B - threshold) * contrast / 255;
          }
        }
        return [R, G, B, pixel[3]];
      }
    }, !!onSelf);
  }

  /**
   * 图像亮度操作
   *
   * @param {number}  brightness 亮度增强值（[-255, 255]）
   * @param {boolean} onSelf 是否对当前实例操作，false 则返回一个新的实例
   */
  brightness(amount: number = 0, onSelf: boolean = true): Yaipt {
    if (this.colorSpace != 'RGB') {
      throw new Error('Yaipt.prototype.beGray - 不支持的色彩空间');
    }

    return this.iterate('RGB', pixel => {
      return [pixel[0] + amount, pixel[1] + amount, pixel[2] + amount, pixel[3]];
    }, !!onSelf);
  }

  /**
   * Yaipt 实例方法，显示图片至 img 或 canvas 元素上
   *
   * @param {HTMLImageElement} image 显示 Yaipt 实例的 img 元素
   * @param {number} offsetRow Yaipt 实例的显示起点（y 轴）
   * @param {number} offsetCol Yaipt 实例的显示起点（x 轴）
   * @param {number} width 自 offsetCol 起显示 Yaipt 实例的宽度
   * @param {number} height 自 offsetRow 起显示 Yaipt 实例的高度
   */
  show(image: HTMLImageElement, offsetRow?: number, offsetCol?: number, width?: number, height?: number);
  /**
   *
   * @param {HTMLImageElement} canvas 显示 Yaipt 实例的 canvas 元素
   * @param {number} offsetRow Yaipt 实例的显示起点（y 轴）
   * @param {number} offsetCol Yaipt 实例的显示起点（x 轴）
   * @param {number} width 自 offsetCol 起显示 Yaipt 实例的宽度
   * @param {number} height 自 offsetRow 起显示 Yaipt 实例的高度
   * @param {number} toRow 显示在 canvas 元素的位置
   * @param {number} toCol 显示在 canvas 元素的位置
   */
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
          this.pixels.generatImageData(offsetRow, offsetCol, width, height), 0, 0
        );

        to.src = Yaipt.__canvas.toDataURL();
      } else if (to instanceof HTMLCanvasElement) {
        let context = to.getContext('2d');
        context.clearRect(toCol, toRow, width, height);
        context.putImageData(
          this.pixels.generatImageData(offsetRow, offsetCol, width, height), 0, 0, toCol, toRow, width, height
        );
      } else {
        throw new Error('Yaipt.prototype.show 错误的参数类型');
      }
    } else {
      throw new Error('Yaipt.prototype.show 错误的参数类型');
    }
  }

  /**
   * 新建 Yaipt 实例的图片源
   * @param {HTMLImageElement} image 页面中 img 元素
   */
  static setImage(image: HTMLImageElement);
  /**
   * 新建 Yaipt 实例的图片源
   * @param {string} link URL，图片链接，对于跨域图片需要对方支持 CORS
   */
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

        image.addEventListener('error', (e) => {
          reject(e);
            console.error('Yaipt.setImage：图片下载出现错误', e);
        })

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
