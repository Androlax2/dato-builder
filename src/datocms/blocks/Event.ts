import { BlockBuilder } from "dato-builder";

// USA and Canada timezones
const US_CANADA_TIMEZONES = [
  // Canada
  "America/Toronto", // Eastern Time
  "America/Vancouver", // Pacific Time
  "America/Edmonton", // Mountain Time
  "America/Calgary", // Mountain Time
  "America/Winnipeg", // Central Time
  "America/Halifax", // Atlantic Time
  "America/St_Johns", // Newfoundland Time
  "America/Moncton", // Atlantic Time
  "America/Regina", // Central Time (no DST)
  "America/Saskatoon", // Central Time (no DST)
  "America/Iqaluit", // Eastern Time
  "America/Yellowknife", // Mountain Time
  "America/Whitehorse", // Pacific Time
  "America/Dawson", // Pacific Time
  "America/Dawson_Creek", // Mountain Time (no DST)
  "America/Fort_Nelson", // Mountain Time (no DST)
  "America/Creston", // Mountain Time (no DST)
  "America/Cambridge_Bay", // Mountain Time
  "America/Rankin_Inlet", // Central Time
  "America/Resolute", // Central Time
  "America/Coral_Harbour", // Eastern Time (no DST)
  "America/Thunder_Bay", // Eastern Time
  "America/Nipigon", // Eastern Time
  "America/Rainy_River", // Central Time
  "America/Swift_Current", // Central Time (no DST)
  "America/Pangnirtung", // Eastern Time
  "America/Glace_Bay", // Atlantic Time
  "America/Goose_Bay", // Atlantic Time
  "America/Blanc-Sablon", // Atlantic Time (no DST)

  // United States
  "America/New_York", // Eastern Time
  "America/Detroit", // Eastern Time
  "America/Kentucky/Louisville", // Eastern Time
  "America/Kentucky/Monticello", // Eastern Time
  "America/Indiana/Indianapolis", // Eastern Time
  "America/Indiana/Vincennes", // Eastern Time
  "America/Indiana/Winamac", // Eastern Time
  "America/Indiana/Marengo", // Eastern Time
  "America/Indiana/Petersburg", // Eastern Time
  "America/Indiana/Vevay", // Eastern Time
  "America/Chicago", // Central Time
  "America/Indiana/Tell_City", // Central Time
  "America/Indiana/Knox", // Central Time
  "America/Menominee", // Central Time
  "America/North_Dakota/Center", // Central Time
  "America/North_Dakota/New_Salem", // Central Time
  "America/North_Dakota/Beulah", // Central Time
  "America/Denver", // Mountain Time
  "America/Boise", // Mountain Time
  "America/Phoenix", // Mountain Time (no DST)
  "America/Los_Angeles", // Pacific Time
  "America/Anchorage", // Alaska Time
  "America/Juneau", // Alaska Time
  "America/Sitka", // Alaska Time
  "America/Metlakatla", // Alaska Time
  "America/Yakutat", // Alaska Time
  "America/Nome", // Alaska Time
  "America/Adak", // Hawaii-Aleutian Time
  "Pacific/Honolulu", // Hawaii Time
] as const;

// Export the type for use in other parts of the codebase
export type USCanadaTimezone = (typeof US_CANADA_TIMEZONES)[number];

export async function buildEventBlock() {
  return new BlockBuilder("Event")
    .addDateTime({
      label: "Date",
      body: {
        validators: {
          required: true,
        },
      },
    })
    .addText({
      label: "Timezone",
      body: {
        default_value: "America/Toronto",
        validators: {
          required: true,
          enum: {
            values: [...US_CANADA_TIMEZONES],
          },
        },
      },
    })
    .addText({
      label: "Location",
      body: {
        validators: {
          required: true,
        },
      },
    })
    .addText({
      label: "Venue",
      body: {
        validators: {
          required: true,
        },
      },
    })
    .upsert();
}

void buildEventBlock();
