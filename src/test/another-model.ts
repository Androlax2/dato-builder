import ModelBuilder from "../ModelBuilder";

const AnotherModel = new ModelBuilder("Another Model 2").addJson({
  label: "JSON",
});

void AnotherModel.create();
void AnotherModel.upsert();
