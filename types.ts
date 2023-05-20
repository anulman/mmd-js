/// <reference types="node" />

export enum Type {
  DOC_START_TOKEN = 0,
  LINE_HR = 1,
  LINE_SETEXT_1 = 2,
  LINE_SETEXT_2 = 3,
  LINE_YAML = 4,
  LINE_CONTINUATION = 5,
  LINE_PLAIN = 6,
  LINE_INDENTED_TAB = 7,
  LINE_INDENTED_SPACE = 8,
  LINE_TABLE = 9,
  LINE_TABLE_SEPARATOR = 10,
  LINE_FALLBACK = 11,
  LINE_HTML = 12,
  LINE_ATX_1 = 13,
  LINE_ATX_2 = 14,
  LINE_ATX_3 = 15,
  LINE_ATX_4 = 16,
  LINE_ATX_5 = 17,
  LINE_ATX_6 = 18,
  LINE_BLOCKQUOTE = 19,
  LINE_LIST_BULLETED = 20,
  LINE_LIST_ENUMERATED = 21,
  LINE_DEF_ABBREVIATION = 22,
  LINE_DEF_CITATION = 23,
  LINE_DEF_FOOTNOTE = 24,
  LINE_DEF_GLOSSARY = 25,
  LINE_DEF_LINK = 26,
  LINE_TOC = 27,
  LINE_DEFINITION = 28,
  LINE_META = 29,
  LINE_BACKTICK = 30,
  LINE_FENCE_BACKTICK_3 = 31,
  LINE_FENCE_BACKTICK_4 = 32,
  LINE_FENCE_BACKTICK_5 = 33,
  LINE_FENCE_BACKTICK_START_3 = 34,
  LINE_FENCE_BACKTICK_START_4 = 35,
  LINE_FENCE_BACKTICK_START_5 = 36,
  LINE_STOP_COMMENT = 37,
  LINE_EMPTY = 38,
  LINE_START_COMMENT = 39,
  BLOCK_BLOCKQUOTE = 50,
  BLOCK_CODE_FENCED = 51,
  BLOCK_CODE_INDENTED = 52,
  BLOCK_DEFLIST = 53,
  BLOCK_DEFINITION = 54,
  BLOCK_DEF_ABBREVIATION = 55,
  BLOCK_DEF_CITATION = 56,
  BLOCK_DEF_GLOSSARY = 57,
  BLOCK_DEF_FOOTNOTE = 58,
  BLOCK_DEF_LINK = 59,
  BLOCK_EMPTY = 60,
  BLOCK_HEADING = 61,
  BLOCK_H1 = 62,
  BLOCK_H2 = 63,
  BLOCK_H3 = 64,
  BLOCK_H4 = 65,
  BLOCK_H5 = 66,
  BLOCK_H6 = 67,
  BLOCK_HR = 68,
  BLOCK_HTML = 69,
  BLOCK_LIST_BULLETED = 70,
  BLOCK_LIST_BULLETED_LOOSE = 71,
  BLOCK_LIST_ENUMERATED = 72,
  BLOCK_LIST_ENUMERATED_LOOSE = 73,
  BLOCK_LIST_ITEM = 74,
  BLOCK_LIST_ITEM_TIGHT = 75,
  BLOCK_META = 76,
  BLOCK_PARA = 77,
  BLOCK_SETEXT_1 = 78,
  BLOCK_SETEXT_2 = 79,
  BLOCK_TABLE = 80,
  BLOCK_TABLE_HEADER = 81,
  BLOCK_TABLE_SECTION = 82,
  BLOCK_TERM = 83,
  BLOCK_TOC = 84,
  CRITIC_ADD_OPEN = 85,
  CRITIC_ADD_CLOSE = 86,
  CRITIC_DEL_OPEN = 87,
  CRITIC_DEL_CLOSE = 88,
  CRITIC_COM_OPEN = 89,
  CRITIC_COM_CLOSE = 90,
  CRITIC_SUB_OPEN = 91,
  CRITIC_SUB_DIV = 92,
  CRITIC_SUB_DIV_A = 93,
  CRITIC_SUB_DIV_B = 94,
  CRITIC_SUB_CLOSE = 95,
  CRITIC_HI_OPEN = 96,
  CRITIC_HI_CLOSE = 97,
  PAIR_CRITIC_ADD = 98,
  PAIR_CRITIC_DEL = 99,
  PAIR_CRITIC_COM = 100,
  PAIR_CRITIC_SUB_ADD = 101,
  PAIR_CRITIC_SUB_DEL = 102,
  PAIR_CRITIC_HI = 103,
  PAIRS = 104,
  PAIR_ANGLE = 105,
  PAIR_BACKTICK = 106,
  PAIR_BRACKET = 107,
  PAIR_BRACKET_ABBREVIATION = 108,
  PAIR_BRACKET_FOOTNOTE = 109,
  PAIR_BRACKET_GLOSSARY = 110,
  PAIR_BRACKET_CITATION = 111,
  PAIR_BRACKET_IMAGE = 112,
  PAIR_BRACKET_VARIABLE = 113,
  PAIR_BRACE = 114,
  PAIR_EMPH = 115,
  PAIR_MATH = 116,
  PAIR_PAREN = 117,
  PAIR_PAREN_LINK = 118,
  PAIR_QUOTE_SINGLE = 119,
  PAIR_QUOTE_DOUBLE = 120,
  PAIR_QUOTE_ALT = 121,
  PAIR_RAW_FILTER = 122,
  PAIR_SUBSCRIPT = 123,
  PAIR_SUPERSCRIPT = 124,
  PAIR_STAR = 125,
  PAIR_STRONG = 126,
  PAIR_UL = 127,
  PAIR_BRACES = 128,
  MARKUP = 129,
  STAR = 130,
  UL = 131,
  EMPH_START = 132,
  EMPH_STOP = 133,
  STRONG_START = 134,
  STRONG_STOP = 135,
  BRACKET_LEFT = 136,
  BRACKET_RIGHT = 137,
  BRACKET_ABBREVIATION_LEFT = 138,
  BRACKET_FOOTNOTE_LEFT = 139,
  BRACKET_GLOSSARY_LEFT = 140,
  BRACKET_CITATION_LEFT = 141,
  BRACKET_IMAGE_LEFT = 142,
  BRACKET_VARIABLE_LEFT = 143,
  PAREN_LEFT = 144,
  PAREN_RIGHT = 145,
  PAREN_LINK_LEFT = 146,
  PAREN_LINK_RIGHT = 147,
  ANGLE_LEFT = 148,
  ANGLE_RIGHT = 149,
  BRACE_DOUBLE_LEFT = 150,
  BRACE_DOUBLE_RIGHT = 151,
  AMPERSAND = 152,
  AMPERSAND_LONG = 153,
  APOSTROPHE = 154,
  BACKTICK = 155,
  CODE_FENCE_LINE = 156,
  CODE_FENCE = 157,
  COLON = 158,
  DASH_M = 159,
  DASH_N = 160,
  ELLIPSIS = 161,
  QUOTE_SINGLE = 162,
  QUOTE_DOUBLE = 163,
  QUOTE_LEFT_SINGLE = 164,
  QUOTE_RIGHT_SINGLE = 165,
  QUOTE_LEFT_DOUBLE = 166,
  QUOTE_RIGHT_DOUBLE = 167,
  QUOTE_RIGHT_ALT = 168,
  ESCAPED_CHARACTER = 169,
  HTML_ENTITY = 170,
  HTML_COMMENT_START = 171,
  HTML_COMMENT_STOP = 172,
  PAIR_HTML_COMMENT = 173,
  MATH_PAREN_OPEN = 174,
  MATH_PAREN_CLOSE = 175,
  MATH_BRACKET_OPEN = 176,
  MATH_BRACKET_CLOSE = 177,
  MATH_DOLLAR_SINGLE = 178,
  MATH_DOLLAR_DOUBLE = 179,
  EQUAL = 180,
  PIPE = 181,
  PLUS = 182,
  SLASH = 183,
  SUPERSCRIPT = 184,
  SUBSCRIPT = 185,
  INDENT_TAB = 186,
  INDENT_SPACE = 187,
  NON_INDENT_SPACE = 188,
  HASH1 = 189,
  HASH2 = 190,
  HASH3 = 191,
  HASH4 = 192,
  HASH5 = 193,
  HASH6 = 194,
  MARKER_BLOCKQUOTE = 195,
  MARKER_H1 = 196,
  MARKER_H2 = 197,
  MARKER_H3 = 198,
  MARKER_H4 = 199,
  MARKER_H5 = 200,
  MARKER_H6 = 201,
  MARKER_SETEXT_1 = 202,
  MARKER_SETEXT_2 = 203,
  MARKER_LIST_BULLET = 204,
  MARKER_LIST_ENUMERATOR = 205,
  MARKER_DEFLIST_COLON = 206,
  TABLE_ROW = 207,
  TABLE_CELL = 208,
  TABLE_DIVIDER = 209,
  TOC = 210,
  TOC_SINGLE = 211,
  TOC_RANGE = 212,
  TEXT_BACKSLASH = 213,
  RAW_FILTER_LEFT = 214,
  TEXT_BRACE_LEFT = 215,
  TEXT_BRACE_RIGHT = 216,
  TEXT_EMPTY = 217,
  TEXT_HASH = 218,
  TEXT_LINEBREAK = 219,
  TEXT_LINEBREAK_SP = 220,
  TEXT_NL = 221,
  TEXT_NL_SP = 222,
  TEXT_NUMBER_POSS_LIST = 223,
  TEXT_PERCENT = 224,
  TEXT_PERIOD = 225,
  TEXT_PLAIN = 226,
  MANUAL_LABEL = 227,
  OBJECT_REPLACEMENT_CHARACTER = 228,
}

export type Token = {
  type: Type;
  can_open: boolean;
  can_close: boolean;
  unmatched: boolean;
  start: number;
  len: number;
  out_start: number;
  out_len: number;
  next?: Token;
  prev?: Token;
  child?: Token;
  tail?: Token;
  mate?: Token;
};

export declare const parse: (input: Buffer | ArrayBuffer) => Token;
export declare const ready: () => Promise<unknown>;
export declare const read: (
  input: Buffer | ArrayBuffer,
  token: Token
) => string;
export declare const readTitle: (
  input: Buffer | ArrayBuffer,
  token: Token
) => string;
export declare const walk: (
  token: Token,
  fn: (token: Token) => void | {
    stopWalking: boolean;
  }
) => void;
