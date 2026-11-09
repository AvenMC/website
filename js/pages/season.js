import { replaceContent } from "../dom.js?v=27";
import { renderLayout } from "../layout.js?v=27";
import { createRankStatsSection } from "./rankStats.js?v=27";

const app = renderLayout("season");

replaceContent(app, createRankStatsSection({ pageHeading: true }));
