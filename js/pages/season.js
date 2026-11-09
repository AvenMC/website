import { replaceContent } from "../dom.js?v=34";
import { renderLayout } from "../layout.js?v=34";
import { createRankStatsSection } from "./rankStats.js?v=34";

const app = renderLayout("season");

replaceContent(app, createRankStatsSection({ pageHeading: true }));
