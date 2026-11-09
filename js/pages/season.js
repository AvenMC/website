import { replaceContent } from "../dom.js?v=26";
import { renderLayout } from "../layout.js?v=26";
import { createRankStatsSection } from "./rankStats.js?v=26";

const app = renderLayout("season");

replaceContent(app, createRankStatsSection({ pageHeading: true }));
