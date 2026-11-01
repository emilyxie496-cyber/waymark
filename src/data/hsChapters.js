/*
  HS chapter reference data, bundled at build time from hs_code_list.txt
  (project root) via Vite's ?raw import — no runtime file access or absolute paths.
  The list holds 2-digit chapters only; see utils/hsChapters.js.
*/
import raw from '../../hs_code_list.txt?raw'
import { buildHsIndex, parseHsChapters } from '../utils/hsChapters.js'

export const HS_CHAPTERS = parseHsChapters(raw)
export const HS_INDEX = buildHsIndex(HS_CHAPTERS)
