import * as React from "react";

export const numLevels = 5;
export const levels: {
  [key: number]: {
    bits: number;
    edit: "binary" | "hexadecimal";
    title: string;
    instruction: string | React.ReactElement<any>;
  };
} = {
  0: {
    bits: 1,
    edit: "binary",
    title: "On and Off",
    instruction: (
      <span>
        Each pixel in the image is represented by a single bit. Use 1 to make a
        pixel white, and 0 to make a pixel black.
        <br />
        Draw a picture using 1's and 0's.
        <br />
        All white space (spaces and new lines) are ignored so you can format the
        text as you please.
      </span>
    ),
  },
  1: {
    bits: 3,
    edit: "binary",
    title: "Red, Green, and Blue",
    instruction: (
      <span>
        Each pixel in the image is now represented by three bits. The first bit
        represents red, the second green, and the third blue.
        <br />
        You can create new colours by mixing red, green, and blue.
        <br />
        e.g. 010 is just green (red off, green on, blue off), but 101 mixes red
        and blue to make magenta.
        <br />
        Draw a colourful picture using 1's and 0's.
      </span>
    ),
  },
  2: {
    bits: 6,
    edit: "binary",
    title: "More Colours",
    instruction: (
      <span>
        Each pixel in the image is now represented by six bits. Two for red, two
        for green, and two for blue.
        <br />
        You can now create even more colours by using four shades of each colour
        component: 00, 01, 10, and 11.
        <br />
        e.g. Bright green is 001100 (zero red, full green, zero blue), but dark
        green is 000100.
        <br />
        As each pixel is six bits, you can now choose from 64 different colours
        in total.
        <br />
        Draw another colourful picture using 1's and 0's.
      </span>
    ),
  },
  3: {
    bits: 12,
    edit: "binary",
    title: "Even More Colours",
    instruction: (
      <span>
        Each pixel in the image is now represented by twelve bits. Four for red,
        four for green, and four for blue.
        <br />
        e.g. Bright green is represented as 000011110000 (zero red, full green,
        zero blue).
        <br />
        As each pixel is twelve bits, you can now choose from 4096 different
        colours in total.
        <br />
        Draw an even more colourful picture using 1's and 0's.
        <p>
          A hexadecimal view is also shown so that you can see how binary can be
          abbreviated as hexadecimal.
          <br />
          e.g. 000011110000 is written in hexadecimal as 0F0. This makes it much
          easier to see the red, green, and blue values at a glance.
        </p>
      </span>
    ),
  },
  4: {
    bits: 24,
    edit: "hexadecimal",
    title: "Your Masterpiece",
    instruction: (
      <span>
        Each pixel in the image is now represented by twenty-four bits. Eight
        for red, eight for green, and eight for blue.
        <br />
        As each pixel is twenty-four bits, you can now choose from over 16
        million different colours.
        <br />
        Drawing a picture using binary will be very tedious, so this time you'll
        be using hexadecimal to draw your final masterpiece.
        <br/>
        Each pixel is 6 hexadecimal digits. e.g. Bright green is written as 00FF00 (zero red, full green, zero blue)
      </span>
    ),
  },
};
