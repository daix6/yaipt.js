import PixelArray from './PixelArray';

export default class Yaipt {
  public width: number;
  public height: number;
  public colorSpace: string;
  public originImageData: ImageData;
  public pixels: PixelArray;

  constructor(imageData: ImageData) {
    this.width = imageData.width;
    this.height = imageData.height;
    this.colorSpace = 'RGB';
    this.originImageData = imageData;
    this.pixels = new PixelArray(imageData.data);
  }
};
