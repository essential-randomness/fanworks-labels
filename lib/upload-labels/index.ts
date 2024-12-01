import { type ComAtprotoLabelDefs } from "@atproto/api";
import {
  type LoginCredentials,
  setLabelerLabelDefinitions,
} from "@skyware/labeler/scripts";
import "dotenv/config";
import labelsConfig from "../../labels";

const loginCredentials: LoginCredentials = {
  identifier: process.env.BSKY_IDENTIFIER!,
  password: process.env.BSKY_PASSWORD!,
};

const labelDefinitions: ComAtprotoLabelDefs.LabelValueDefinition[] = [];

for (const label of labelsConfig.labels) {
  const labelValueDefinition: ComAtprotoLabelDefs.LabelValueDefinition = {
    identifier: label.value,
    severity: "inform",
    blurs: "none",
    defaultSetting: "warn",
    adultOnly: false,
    locales: [
      { lang: "en", name: label.displayName, description: label.description },
    ],
  };

  labelDefinitions.push(labelValueDefinition);
}

try {
  await setLabelerLabelDefinitions(loginCredentials, labelDefinitions);
  console.info("Label definitions set successfully.");
} catch (error) {
  console.error(`Error setting label definitions: ${error}`);
}
