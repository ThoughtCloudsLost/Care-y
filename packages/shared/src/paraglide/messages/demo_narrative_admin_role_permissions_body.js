/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Role_Permissions_BodyInputs */

const en_demo_narrative_admin_role_permissions_body = /** @type {(inputs: Demo_Narrative_Admin_Role_Permissions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The matrix sets fifty permissions against the three roles, grouped by the area each permission governs rather than by the role that holds it by default. [[#permissions]]
**What a toggle writes.** Changing a cell writes one override row for that role and that permission, and setting a cell back to its shipped value deletes the row instead of storing it, which keeps the table to the changes an organization actually made. The organization's cached permission sets are dropped on the same request, so the change applies to every account holding that role from the next request onward rather than at their next sign-in. [[#permissions]]
**Three permissions that cannot move.** Manage keys, Manage roles and Manage infrastructure stay with the administrator role. The rule is applied when an override is written, where the mutation refuses, and again when permissions are read, where the merge adds them back for the administrator and strips them from everyone else, so a row inserted straight into the database granting one of them to another role has no effect. [[#permissions #keys]]
**Two permissions that do more than gate a screen.** View intake responses decides who receives decryption keys at the moment a form is submitted, so revoking it stops new keys and does not take back the ones already issued. Manage queue membership decides who may add an account to a queue, and membership itself grants read access to every case in that queue. [Queue management](#admin-people/queues) covers that grant. [[#keys #permissions]]
**A name with nothing behind it.** View own shifts is in the matrix so its name stays settled while shift scheduling is in development, and granting it changes nothing until then. [Shift scheduling](#schedule/intro) covers the planned scope. [[#permissions]]
**Reset, and who may read the matrix at all.** Resetting deletes every override row after a confirmation, which returns all three roles to their shipped sets in one step. Reading the matrix and editing it both run on Manage roles, so an account that administers the roster cannot see what the roster's roles are permitted to do. [[#permissions]]`)
};

const es_demo_narrative_admin_role_permissions_body = /** @type {(inputs: Demo_Narrative_Admin_Role_Permissions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La matriz enfrenta cincuenta permisos a los tres roles, agrupados por el área que gobierna cada permiso y no por el rol que lo tiene de forma predeterminada. [[#permissions]]
**Lo que escribe un cambio de celda.** Cambiar una celda escribe una fila de excepción para ese rol y ese permiso, y devolver una celda a su valor de origen borra la fila en lugar de guardarla, lo que reduce la tabla a los cambios que la organización hizo de verdad. Los conjuntos de permisos en caché de la organización se descartan en la misma petición, así que el cambio se aplica a todas las cuentas con ese rol a partir de la siguiente petición y no en su siguiente inicio de sesión. [[#permissions]]
**Tres permisos que no se pueden mover.** Gestionar claves, Gestionar roles y Gestionar infraestructura se quedan con el rol de administración. La regla se aplica al escribir una excepción, donde la mutación la rechaza, y otra vez al leer los permisos, donde la combinación los devuelve al rol de administración y los quita a los demás, de modo que una fila insertada directamente en la base de datos que conceda uno de ellos a otro rol no tiene ningún efecto. [[#permissions #keys]]
**Dos permisos que hacen más que abrir una pantalla.** Ver respuestas de ingreso decide quién recibe las claves de descifrado en el momento en que se envía un formulario, así que revocarlo detiene las claves nuevas y no retira las ya entregadas. Gestionar membresía de colas decide quién puede agregar una cuenta a una cola, y la pertenencia en sí concede acceso de lectura a todos los casos de esa cola. [Gestión de colas](#admin-people/queues) trata esa concesión. [[#keys #permissions]]
**Un nombre sin nada detrás.** Ver turnos propios está en la matriz para fijar su nombre mientras la programación de turnos está en desarrollo, y concederlo no cambia nada hasta entonces. [Programación de turnos](#schedule/intro) trata el alcance previsto. [[#permissions]]
**Restablecer, y quién puede leer la matriz.** Restablecer borra todas las filas de excepción tras una confirmación, lo que devuelve los tres roles a sus conjuntos de origen de una vez. Leer la matriz y editarla dependen de Gestionar roles, así que una cuenta que administra el directorio no puede ver qué tienen permitido hacer los roles de ese directorio. [[#permissions]]`)
};

const en_xa2_demo_narrative_admin_role_permissions_body = /** @type {(inputs: Demo_Narrative_Admin_Role_Permissions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè pèrmìssìòn màtrìx òn thè pèòplè pàgè shòws whìch càpàbìlìtìès èàch ròlè grànts, wìth fìfty pèrmìssìòns àrràngèd àcròss èìght càpàbìlìty gròùps.
 •••••••••••••••••••••••••••••••••••••••••••••**Càpàbìlìty gròùps. ••••••** Thè pèrmìssìòns àrè òrgànìzèd by thè àrèà thèy gòvèrn ràthèr thàn by whìch ròlè hòlds thèm. Gròùps còvèr thè càsè rècòrd, rèàchìng à clìènt, thè clìènt's àccèss tò à càsè, clìènt rècòrds, thè knòwlèdgè bàsè, qùèùès, ìntàkè, ànd rùnnìng thè òrgànìzàtìòn. Bècàùsè gròùpìng ànd ròlè lèvèl àrè ìndèpèndènt, à pèrmìssìòn's gròùp dòès nòt tèll thè rèàdèr whìch ròlè hòlds ìt by dèfàùlt.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Dèfàùlts ànd òvèrrìdès. •••••••** Èàch ròlè shìps wìth à dèfàùlt pèrmìssìòn sèt, ànd thè òrgànìzàtìòn càn chàngè àny pèrmìssìòn thàt ìs nòt lòckèd by tògglìng ìts cèll. Thè fìrst twò ròlè nàmès àrè dèfàùlts thè òrgànìzàtìòn càn rènàmè ìn tèrmìnòlògy sèttìngs, whìlè àdmìnìstràtòr ìs fìxèd. Tògglìng à cèll tàkès èffèct ìmmèdìàtèly fòr èvèry ùsèr hòldìng thàt ròlè, ànd cèlls thàt hàvè bèèn chàngèd fròm thèìr dèfàùlt àrè màrkèd.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Lòckèd pèrmìssìòns. ••••••** Thrèè pèrmìssìòns stày wìth thè àdmìnìstràtòr ròlè règàrdlèss òf òvèrrìdès ànd cànnòt bè tògglèd àwày. Thèy pròtèct kèy mànàgèmènt, ròlè mànàgèmènt, ànd ìnfràstrùctùrè cònfìgùràtìòn, ànd thè ènfòrcèmènt àpplìès whèn pèrmìssìòns àrè wrìttèn ànd whèn thèy àrè rèàd, sò à ròw ìnsèrtèd stràìght ìntò thè dàtàbàsè gràntìng ònè òf thèm tò ànòthèr ròlè hàs nò èffèct.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Qùèùè mèmbèrshìp scòpè. •••••••** Àddìng à ùsèr tò à qùèùè grànts thèm rèàd àccèss tò èvèry càsè ìn thàt qùèùè, sò thè scòpè òf gràntìng thè Mànàgè qùèùè mèmbèrshìp pèrmìssìòn ìs wìdèr thàn ìt àppèàrs.
 •••••••••••••••••••••••••••••••••••••••••••••••••••**Ìntàkè rèspònsè dècryptìòn. •••••••••** Thè Vìèw ìntàkè rèspònsès pèrmìssìòn còntròls whò rècèìvès dècryptìòn kèys whèn à fòrm ìs sùbmìttèd, ànd rèvòkìng ìt làtèr dòès nòt tàkè bàck kèys àlrèàdy ìssùèd.
 ••••••••••••••••••••••••••••••••••••••••••••••••••**Rèsèt. ••** Rèsèttìng thè màtrìx rètùrns èvèry pèrmìssìòn tò ìts shìppèd dèfàùlt àftèr à cònfìrmàtìòn dìàlòg.
 ••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Chàngìng thè màtrìx rèqùìrès thè Mànàgè ròlès pèrmìssìòn. ••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The matrix sets fifty permissions against the three roles, grouped by the area each permission governs rather than by the role that holds it by default. [[#p..." |
*
* @param {Demo_Narrative_Admin_Role_Permissions_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_role_permissions_body = /** @type {((inputs?: Demo_Narrative_Admin_Role_Permissions_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Role_Permissions_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_role_permissions_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_role_permissions_body(inputs)
	return en_demo_narrative_admin_role_permissions_body(inputs)
});