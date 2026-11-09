import { replaceContent } from "../dom.js?v=28";
import { renderLayout } from "../layout.js?v=28";
import { createRankStatsSection } from "./rankStats.js?v=28";

const app = renderLayout("season");

replaceContent(app, createRankStatsSection({ pageHeading: true }));
