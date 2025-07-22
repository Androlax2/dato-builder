import { BlockBuilder } from "dato-builder";
import { DESTINATION_MODEL_ID } from "../constants";
import AirlineModelId from "../models/Airline";
import { buildFixedBasedOperatorsModel } from "../models/FixedBasedOperators";
import buildGeneralInformationsModel from "../models/GeneralInformations";
import { buildParkingModel } from "../models/Parking";
import { buildPermitModel } from "../models/Permit";
import TerminalModelId from "../models/Terminal";

async function main() {
  const terminalModelId = await TerminalModelId;
  const airlineModelId = await AirlineModelId;
  const generalInformationsModelId = await buildGeneralInformationsModel();
  const fixedBasedOperatorsModelId = await buildFixedBasedOperatorsModel();
  const parkingModelId = await buildParkingModel();
  const permitModelId = await buildPermitModel();

  const InfoCardListBlock = new BlockBuilder("Info Card List", {
    hint: "https://www.datocms-assets.com/157633/1746457106-screenshot-2025-05-05-at-10-58-14.png",
  }).addLinks({
    label: "Items",
    body: {
      validators: {
        items_item_type: {
          item_types: [
            airlineModelId,
            DESTINATION_MODEL_ID,
            terminalModelId,
            generalInformationsModelId,
            fixedBasedOperatorsModelId,
            parkingModelId,
            permitModelId,
          ],
        },
        size: {
          min: 1,
        },
      },
    },
  });

  void InfoCardListBlock.upsert();
}

void main();
