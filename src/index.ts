import BlockBuilder from "./BlockBuilder";
import {configureDatoClient} from "./config";

configureDatoClient({
    apiToken: "4138815ad42637c8ad7268e303618e",
});

const TestBlock = new BlockBuilder(
    "Block yolo",
    {},
    {
        overrideExisting: true,
    },
)
    .addInteger("integer Yolo swaagggg")
    .addInteger("integer Yolo swaagggg 2")
    .addInteger("integer Yolo swaagggg 3");

void TestBlock.upsert();
