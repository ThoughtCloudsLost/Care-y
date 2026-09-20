/**
* | output |
* | --- |
* | "Finishing key update: {done} of {total} items. You can keep working; leave the app open if you can." |
*
* @param {Reseal_Banner_ProgressInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const reseal_banner_progress: ((inputs: Reseal_Banner_ProgressInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Reseal_Banner_ProgressInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Reseal_Banner_ProgressInputs = {
    done: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
