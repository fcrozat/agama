export const profileSchema = {
  "$schema": "https://json-schema.org/draft/2019-09/schema",
  "title": "Profile",
  "description": "Profile definition for automated installation",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "product": {
      "title": "Product to install",
      "type": "object",
      "additionalProperties": false,
      "required": ["id"],
      "properties": {
        "id": {
          "title": "Product identifier",
          "type": "string"
        },
        "registrationCode": { "type": "string" }
      }
    },
    "user": {
      "title": "First user settings",
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "fullName": { "type": "string" },
        "userName": { "type": "string" },
        "password": { "type": "string" }
      },
      "required": ["fullName", "userName"]
    },
    "l10n": {
      "title": "Localization settings",
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "locale": { "type": "string" },
        "timezone": { "type": "string" }
      }
    }
  }
};
