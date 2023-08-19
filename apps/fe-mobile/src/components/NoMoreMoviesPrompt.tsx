import React from "react";
import { ViewProps } from "react-native";
import { CinemaOld } from "iconoir-react-native";

import { Prompt } from "./Prompt";

export function NoMoreMoviesPrompt({
  onGoBack,
}: ViewProps & {
  onGoBack(): void;
}) {
  return (
    <Prompt
      icon={<CinemaOld />}
      title="We're out of movies ✅"
      subtitle="You've gone through all the movies matching your filters. Try changing your filters or resetting your swipes"
      buttons={[
        {
          title: "Go Back",
          onPress: onGoBack,
        },
      ]}
    />
  );
}
