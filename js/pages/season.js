import { replaceContent } from "../dom.js?v=30";
import { renderLayout } from "../layout.js?v=30";
import { createRankStatsSection } from "./rankStats.js?v=30";

const app = renderLayout("season");

replaceContent(app, createRankStatsSection({ pageHeading: true }));
