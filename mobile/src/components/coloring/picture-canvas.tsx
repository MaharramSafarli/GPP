import type { FreePicture } from '@/data/coloring-pictures';

import { BitmapCanvas } from './bitmap-canvas';
import { ShapeCanvas } from './shape-canvas';

type Props = { pic: FreePicture; fills: string[]; width: number; onFill?: (index: number) => void };

/** Draws any free-coloring picture (shapes or line drawing). */
export function PictureCanvas({ pic, ...rest }: Props) {
  return pic.bitmap ? <BitmapCanvas pic={pic.bitmap} {...rest} /> : <ShapeCanvas shapes={pic.shapes} {...rest} />;
}

/** Height ÷ width of the picture. */
export const pictureRatio = (pic: FreePicture) => (pic.bitmap ? pic.bitmap.height / pic.bitmap.width : 1.2);
