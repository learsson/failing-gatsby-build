export const ContentfulDataTypes = new Map([
  [
    `Symbol`,
    () => {
      return { type: `String` };
    },
  ],
  [
    `Text`,
    (field) => {
      return {
        type: `ContentfulText`,
        extensions: {
          link: { by: `id`, from: field.id },
        },
      };
    },
  ],
  [
    `Integer`,
    () => {
      return { type: `Int` };
    },
  ],
  [
    `Number`,
    () => {
      return { type: `Float` };
    },
  ],
  [
    `Date`,
    () => {
      return {
        type: `Date`,
        extensions: {
          dateformat: {},
        },
      };
    },
  ],
  [
    `Object`,
    () => {
      return { type: `JSON` };
    },
  ],
  [
    `Boolean`,
    () => {
      return { type: `Boolean` };
    },
  ],
  [
    `Location`,
    () => {
      return { type: `ContentfulLocation` };
    },
  ],
  [
    `RichText`,
    () => {
      return { type: `ContentfulRichText` };
    },
  ],
]);
