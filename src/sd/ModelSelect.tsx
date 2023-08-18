import React, { FunctionComponent } from "react";
import { Trans, t } from "@lingui/macro";

import { ArrowDropDown } from "@mui/icons-material";
import {
  Box,
  Fade,
  FormControl,
  InputBaseComponentProps,
  InputLabel,
  Modal,
  OutlinedInput,
} from "@mui/material";

import { ModelState } from "./useModelState";
import models from "../config/models";
import type { Model } from "../config/models";

const SelectRow = React.memo(function SelectRow({
  value,
  setValue,
  selected,
  setOpen,
}: {
  value: string;
  setValue: (value: string) => void;
  selected: boolean;
  setOpen: (value: boolean) => void;
}) {
  const model = models[value];

  return (
    <div
      key={model.MODEL_ID}
      className="SelectRow"
      onClick={() => {
        setValue(value);
        setOpen(false);
      }}
    >
      <style jsx>{`
        .SelectRow {
          padding: 5px 10px 5px 10px;
          marginbottom: 5px;
          background: ${selected && "#eef"};
          text-align: center;
        }
        .SelectRow:hover {
          background: ${selected ? "#ddf" : "#eee"};
        }
      `}</style>
      <div style={{ fontWeight: "bold" }}>{model.MODEL_ID}</div>
      <div>{model.description}</div>
    </div>
  );
});

const sorts = {
  alpha: (a: Model, b: Model) => a.MODEL_ID.localeCompare(b.MODEL_ID),
  date: (a: Model, b: Model) => b.dateAdded.getTime() - a.dateAdded.getTime(),
};

const ModelSelectModalContents = React.forwardRef(
  function ModelSelectModalContents(
    {
      open,
      setOpen,
      value,
      setValue,
    }: {
      open: boolean;
      setOpen: (value: boolean) => void;
      value: string;
      setValue: (value: string) => void;
    },
    ref: React.ForwardedRef<HTMLInputElement>
  ) {
    const [baseModelFilter, setBaseModelFilter] = React.useState("all");
    const [modelOriginFilter, setModelOriginFilter] = React.useState("all");
    const [inpaintFilter, setInpaintFilter] = React.useState(true);
    const [tagFilter, setTagFilter] = React.useState("");
    const inInpaint = location.pathname === "/inpaint";
    const [sort, setSort] = React.useState<"alpha" | "date">("alpha");

    const filteredModels = React.useMemo(() => {
      const filteredModels = Object.values(models).filter(
        (model) =>
          !model.hidden &&
          (modelOriginFilter === "all" ||
            model.ogModel === (modelOriginFilter === "og" ? true : false)) &&
          (baseModelFilter === "all" || model.baseModel === baseModelFilter) &&
          ((!inInpaint && !model.MODEL_ID.match(/[Ii]npaint/)) ||
            (inInpaint &&
              (!inpaintFilter ||
                (inpaintFilter && model.MODEL_ID.match(/[Ii]npaint/))))) &&
          (tagFilter === "" || model.tags?.includes(tagFilter))
      );
      return filteredModels;
    }, [
      modelOriginFilter,
      baseModelFilter,
      inpaintFilter,
      inInpaint,
      tagFilter,
    ]);

    const sortedModels = React.useMemo(() => {
      return filteredModels.sort(sorts[sort]);
    }, [filteredModels, sort]);

    const baseModels = React.useMemo(
      () => {
        const baseModels = new Set<string>();
        for (const model of Object.values(models)) {
          baseModels.add(model.baseModel);
        }
        return Array.from(baseModels);
      },
      [
        /* models */
      ]
    );

    const allTags = React.useMemo(
      () => {
        const allTags = new Set<string>();
        for (const model of Object.values(models)) {
          if (model.tags)
            for (const tag of model.tags) {
              allTags.add(tag);
            }
        }

        return Array.from(allTags).sort();
      },
      [
        /* models */
      ]
    );

    return (
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-45%, -50%)",

            width: "100%",
            // maxWidth: 500,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 2,
          }}
        >
          <select
            value={baseModelFilter}
            onChange={(e) => setBaseModelFilter(e.target.value)}
          >
            <option value="all">All Bases</option>
            {baseModels.map((baseModel) => (
              <option key={baseModel} value={baseModel}>
                {baseModel}
              </option>
            ))}
          </select>{" "}
          <select
            value={modelOriginFilter}
            onChange={(e) => setModelOriginFilter(e.target.value)}
          >
            <option value="all">All Origins</option>
            <option value="og">Original</option>
            <option value="community">Community</option>
          </select>{" "}
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          >
            <option value="">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>{" "}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "alpha" | "date")}
          >
            <option value="alpha">Alphabetical</option>
            <option value="date">Date Added</option>
          </select>{" "}
          {inInpaint && (
            <label style={{ whiteSpace: "nowrap" }}>
              <input
                type="checkbox"
                checked={inpaintFilter}
                onChange={() => setInpaintFilter(!inpaintFilter)}
              />{" "}
              Inpainting
            </label>
          )}
          <Box
            sx={{
              maxHeight: "70vh",
              overflow: "auto",
              border: "1px solid #aaa",
              mt: 1,
              mb: 2,
            }}
          >
            {sortedModels.map((model) => (
              <SelectRow
                key={model.MODEL_ID}
                value={model.MODEL_ID}
                setValue={setValue}
                selected={model.MODEL_ID === value}
                setOpen={setOpen}
              />
            ))}
          </Box>
          {/*
      <Stack direction="row" justifyContent="flex-end">
        <Button variant="outlined" onClick={() => setOpen(false)}>
          <Trans>Cancel</Trans>
        </Button>
        <span style={{ width: ".5em" }} />
        <Button variant="contained" onClick={() => setOpen(false)}>
          <Trans>Select</Trans>
        </Button>
      </Stack>
        */}
          <input type="hidden" ref={ref} tabIndex={-1} />
        </Box>
      </Fade>
    );
  }
);

const ModelSelectSelect = React.forwardRef(function ModelSelectSelect(
  {
    value,
    setValue,
    open,
    setOpen,
  }: {
    value: string;
    setValue: (value: string) => void;
    open: boolean;
    setOpen: (value: boolean) => void;
  },
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const model = models[value];

  return (
    <div
      style={{
        paddingTop: "10px",
        paddingBottom: "10px",
        paddingLeft: "10px",
        paddingRight: "32px",
        width: "100%",
        textAlign: "center",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <ArrowDropDown
        sx={{
          position: "absolute",
          right: 5,
          height: "1em",
          top: "calc(50% - 0.5em)",
          color: "rgba(0, 0, 0, 0.54)",
        }}
      />
      <div>
        <b>{model.MODEL_ID}</b>
      </div>
      <div>{model.description}</div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        closeAfterTransition
        sx={{ maxWidth: "90%" }}
        // hideBackdrop
      >
        <ModelSelectModalContents
          open={open}
          value={value}
          setValue={setValue}
          setOpen={setOpen}
          ref={ref}
        />
      </Modal>
    </div>
  );
});

const ModelSelectInputComponent: FunctionComponent<InputBaseComponentProps> =
  React.forwardRef(function ModelSelectInputComponent(props, ref) {
    const { component: Component, ...other } = props;

    // implement `InputElement` interface
    React.useImperativeHandle(ref, () => ({
      focus: () => {
        console.log("ModelSelectInputComponent focus called");
        // logic to focus the rendered component from 3rd party belongs here
      },
      // hiding the value e.g. react-stripe-elements
    }));

    // `Component` will be your `SomeThirdPartyComponent` from below
    return <Component {...other} ref={ref} />;
  });

export default React.memo(function ModelSelect({
  value,
  setValue,
}: {
  value: ModelState["MODEL_ID"]["value"];
  setValue: ModelState["MODEL_ID"]["setValue"];
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <FormControl
      fullWidth
      sx={{ my: 1 }}
      focused={open}
      onClick={() => !open && setOpen(!open)}
    >
      <InputLabel shrink={true}>
        <Trans>Model</Trans>
      </InputLabel>
      <OutlinedInput
        notched={true}
        inputComponent={ModelSelectInputComponent}
        inputProps={{
          open,
          setOpen,
          value,
          setValue,
          component: ModelSelectSelect,
        }}
        label={t`Model`}
        value={value}
      />
      {models[value].notes && (
        <Box sx={{ fontSize: "80%", textAlign: "center" }}>
          {models[value].notes}
        </Box>
      )}
    </FormControl>
  );
});
