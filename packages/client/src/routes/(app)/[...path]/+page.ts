import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = () => {
  error(404, { id: "NOT_FOUND", message: "Not found" });
};
