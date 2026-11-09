import { replaceContent } from "../dom.js?v=33";
import { renderLayout } from "../layout.js?v=33";
import { createRankStatsSection } from "./rankStats.js?v=33";

const app = renderLayout("season");

replaceContent(app, createRankStatsSection({ pageHeading: true }));
