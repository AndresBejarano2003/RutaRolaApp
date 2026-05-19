import { Gif } from "../interfaces/gif.interface";
import { GiphyItem } from "../interfaces/giphy.interfaces";

export class GifMapper {
  static mapGiphyItemTOGif(item: GiphyItem): Gif {
    return {
      id: item.id,
      title: item.title,
      url: item.images.original.url
    }
  }

  static mapGiphyItemsTOGifArray(items: GiphyItem[]): Gif[] {
    return items.map(this.mapGiphyItemTOGif);
  }
}
