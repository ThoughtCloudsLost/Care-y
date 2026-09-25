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
	return /** @type {LocalizedString} */ (`⟦Thè màtrìx sèts fìfty pèrmìssìòns àgàìnst thè thrèè ròlès, gròùpèd by thè àrèà èàch pèrmìssìòn gòvèrns ràthèr thàn by thè ròlè thàt hòlds ìt by dèfàùlt. [[#pèrmìssìòns]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt à tògglè wrìtès. •••••••** Chàngìng à cèll wrìtès ònè òvèrrìdè ròw fòr thàt ròlè ànd thàt pèrmìssìòn, ànd sèttìng à cèll bàck tò ìts shìppèd vàlùè dèlètès thè ròw ìnstèàd òf stòrìng ìt, whìch kèèps thè tàblè tò thè chàngès àn òrgànìzàtìòn àctùàlly màdè. Thè òrgànìzàtìòn's càchèd pèrmìssìòn sèts àrè dròppèd òn thè sàmè rèqùèst, sò thè chàngè àpplìès tò èvèry àccòùnt hòldìng thàt ròlè fròm thè nèxt rèqùèst ònwàrd ràthèr thàn àt thèìr nèxt sìgn-ìn. [[#pèrmìssìòns]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thrèè pèrmìssìòns thàt cànnòt mòvè. •••••••••••** Mànàgè kèys, Mànàgè ròlès ànd Mànàgè ìnfràstrùctùrè stày wìth thè àdmìnìstràtòr ròlè. Thè rùlè ìs àpplìèd whèn àn òvèrrìdè ìs wrìttèn, whèrè thè mùtàtìòn rèfùsès, ànd àgàìn whèn pèrmìssìòns àrè rèàd, whèrè thè mèrgè àdds thèm bàck fòr thè àdmìnìstràtòr ànd strìps thèm fròm èvèryònè èlsè, sò à ròw ìnsèrtèd stràìght ìntò thè dàtàbàsè gràntìng ònè òf thèm tò ànòthèr ròlè hàs nò èffèct. [[#pèrmìssìòns #kèys]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Twò pèrmìssìòns thàt dò mòrè thàn gàtè à scrèèn. •••••••••••••••** Vìèw ìntàkè rèspònsès dècìdès whò rècèìvès dècryptìòn kèys àt thè mòmènt à fòrm ìs sùbmìttèd, sò rèvòkìng ìt stòps nèw kèys ànd dòès nòt tàkè bàck thè ònès àlrèàdy ìssùèd. Mànàgè qùèùè mèmbèrshìp dècìdès whò mày àdd àn àccòùnt tò à qùèùè, ànd mèmbèrshìp ìtsèlf grànts rèàd àccèss tò èvèry càsè ìn thàt qùèùè. [Qùèùè mànàgèmènt](#àdmìn-pèòplè/qùèùès) còvèrs thàt grànt. [[#kèys #pèrmìssìòns]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**À nàmè wìth nòthìng bèhìnd ìt. •••••••••** Vìèw òwn shìfts ìs ìn thè màtrìx sò ìts nàmè stàys sèttlèd whìlè shìft schèdùlìng ìs ìn dèvèlòpmènt, ànd gràntìng ìt chàngès nòthìng ùntìl thèn. [Shìft schèdùlìng](#schèdùlè/ìntrò) còvèrs thè plànnèd scòpè. [[#pèrmìssìòns]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Rèsèt, ànd whò mày rèàd thè màtrìx àt àll. •••••••••••••** Rèsèttìng dèlètès èvèry òvèrrìdè ròw àftèr à cònfìrmàtìòn, whìch rètùrns àll thrèè ròlès tò thèìr shìppèd sèts ìn ònè stèp. Rèàdìng thè màtrìx ànd èdìtìng ìt bòth rùn òn Mànàgè ròlès, sò àn àccòùnt thàt àdmìnìstèrs thè ròstèr cànnòt sèè whàt thè ròstèr's ròlès àrè pèrmìttèd tò dò. [[#pèrmìssìòns]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
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