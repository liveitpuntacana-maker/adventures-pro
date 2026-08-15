import { type SchemaTypeDefinition } from "sanity";
import { categoryType } from "./category";
import { destinationType } from "./destination";
import { localizedStringType } from "./localizedString";
import { localizedTextType } from "./localizedText";
import { postType } from "./post";
import { reviewType } from "./review";
import { teamMemberType } from "./teamMember";
import { tourType } from "./tour";
import { landingPageType } from "./landingPage";
import { aboutPageType } from "./aboutPage";
import { transferPageType } from "./transferPage";
import { contactPageType } from "./contactPage";
import { transferZoneType } from "./transferZone";
import { transferVehicleType } from "./transferVehicle";
import { transferRouteType } from "./transferRoute";
import { transferHotelType } from "./transferHotel";
import { chatSessionType } from "./chatSession";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    localizedStringType,
    localizedTextType,
    categoryType,
    destinationType,
    tourType,
    postType,
    reviewType,
    teamMemberType,
    landingPageType,
    aboutPageType,
    transferPageType,
    contactPageType,
    transferZoneType,
    transferVehicleType,
    transferRouteType,
    transferHotelType,
    chatSessionType,
  ],
};