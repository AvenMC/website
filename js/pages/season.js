import { replaceContent } from "../dom.js?v=29";
import { renderLayout } from "../layout.js?v=29";
import { createRankStatsSection } from "./rankStats.js?v=29";

const app = renderLayout("season");

replaceContent(app, createRankStatsSection({ pageHeading: true }));
