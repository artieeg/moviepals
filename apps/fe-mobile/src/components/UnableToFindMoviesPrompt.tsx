import React from "react";
import { ViewProps } from "react-native";
import { CinemaOld } from "iconoir-react-native";

import { Prompt } from "./Prompt";

export function UnableToFindMoviesPrompt({
  onGoBack,
}: ViewProps & {
  onGoBack(): void;
}) {
  return (
    <Prompt
      icon={<CinemaOld />}
      title="So empty! 🙇‍♂️"
      subtitle="We are unable to find movies matching your filters. Please check your filters and try again 😅"
      buttons={[
        {
          title: "Go Back",
          onPress: onGoBack,
        },
      ]}
    />
  );
}
