/**
* | output |
* | --- |
* | "{count} open with you" |
*
* @param {Dashboard_Shift_Open_With_You_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_shift_open_with_you_one: ((inputs: Dashboard_Shift_Open_With_You_OneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Shift_Open_With_You_OneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Shift_Open_With_You_OneInputs = {
    count: NonNullable<unknown>;
};
