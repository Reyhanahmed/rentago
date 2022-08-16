import { Box } from "@chakra-ui/react";
import { Range, getTrackBackground } from "react-range";

interface ISlider {
  min: number;
  max: number;
  values: number[];
  setValues: (value: number[]) => void;
}

export const Slider = ({ min, max, values, setValues }: ISlider) => {
  return (
    <Range
      values={values}
      step={10}
      min={min}
      max={max}
      onChange={(values) => setValues(values)}
      renderThumb={({ index, props }) => {
        return (
          <div
            {...props}
            style={{
              ...props.style,
              width: "20px",
              height: "20px",
              backgroundColor: "#21b074",
              borderRadius: "100%",
            }}
          >
            <Box
              position="absolute"
              top="-28px"
              color="white"
              fontWeight="bold"
              p="1"
              borderRadius="1"
              bg="primary"
              fontSize="10"
            >
              {values[index]}
            </Box>
          </div>
        );
      }}
      renderTrack={({ children, props }) => {
        return (
          <div
            onMouseDown={props.onMouseDown}
            onTouchStart={props.onTouchStart}
            style={{
              ...props.style,
              height: "36px",
              display: "flex",
              width: "100%",
            }}
          >
            <div
              ref={props.ref}
              style={{
                height: "5px",
                width: "100%",
                borderRadius: "4px",
                background: getTrackBackground({
                  values,
                  colors: ["#ccc", "#21b074", "#ccc"],
                  min,
                  max,
                }),
                alignSelf: "center",
              }}
            >
              {children}
            </div>
          </div>
        );
      }}
    />
  );
};
