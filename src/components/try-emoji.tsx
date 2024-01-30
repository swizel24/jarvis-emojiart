"use client";
import { Animation, AnimationConfig } from "@/components/animation";
import { Dice } from "@/components/dice";
import { EmojiSelector } from "@/components/emoji-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Toaster } from "@/components/ui/toaster";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { presetImage, presetArtStyles } from "@/util/presets";
import { usePrevious } from "@/util/use-previous";
import { useResponse } from "@/util/use-response";
import { getShareUrl, Option, useShare } from "@/util/use-share";
import { Check, Download, Share2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { setEmojiFavicon } from "@/util/set-emoji-favicon";
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  TwitterShareButton,
  XIcon,
} from "react-share";

const animationConfig: AnimationConfig = {
  step: 10,
  min: 400,
  max: 700,
};

const warmOrg = (image: string, shareKey: string): Promise<void> => {
  if (image) {
    return fetch("/api/share", {
      method: "POST",
      body: JSON.stringify({
        image: image,
        key: shareKey,
      }),
    }).then();
  } else {
    return new Promise((resolve) => resolve());
  }
};

export default function TryEmoji() {
  const { option: presetOption, hasShare } = useShare();
  const [playing, setPlaying] = useState(false);
  const { toast } = useToast();
  const [emoji, setEmoji] = useState({
    emoji: presetOption.emoji,
    name: presetOption.name,
  });
  const [preset, setPreset] = useState(
    presetArtStyles.find((p) => p.prompt === presetOption.prompt)!,
  );
  const [strength, setStrength] = useState(presetOption.strength);
  const [seed, setSeed] = useState(presetOption.seed);

  const shareOption: Option = useMemo(() => {
    return {
      emoji: emoji.emoji,
      name: emoji.name,
      prompt: preset.prompt,
      seed: seed,
      strength: strength,
    };
  }, [emoji.emoji, emoji.name, preset.prompt, seed, strength]);

  const { image, loading } = useResponse(
    hasShare,
    emoji.emoji,
    emoji.name,
    preset.prompt,
    strength,
    seed,
  );
  const previousImage = usePrevious(image);

  const mergedImage = useMemo(
    () => image || previousImage || presetImage,
    [image, previousImage],
  );

  useEffect(() => {
    setEmojiFavicon(emoji.emoji);
  }, [emoji.emoji]);

  const shareKey = useMemo(() => {
    return getShareUrl(shareOption);
  }, [shareOption]);

  const shareUrl = useMemo(() => {
    return `https://jarvis-emojiart.netlify.app/?share=${shareKey}`;
  }, [shareKey]);

  return (
    <TooltipProvider delayDuration={50}>
      <Toaster />
      <div className="min-h-screen flex flex-col gap-4 bg-zinc-950 items-center justify-center py-4 md:py-12">
        <div className="text-6xl text-zinc-100">J.A.R.V.I.S.</div>
        <div className="text-xl text-zinc-100">
          Turn emoji into amazing artwork using AI.
        </div>
        <div className="flex items-center justify-center flex-col md:flex-row gap-2 md:gap-4">
          <div className="flex-0 w-full md:w-80">
            <EmojiSelector
              onSelect={(e) => {
                setPlaying(false);
                const prefix =
                  e.keywords.indexOf("animal") > -1 ? "super cute" : "";
                const keyword = e.keywords.join(", ");
                const emoji = e.native;
                const name = `${prefix} ${e.name}, ${keyword}`;
                setEmoji({ emoji, name });
              }}
            ></EmojiSelector>
          </div>
          <div className="flex-1">
            <div className="max-w-[100vw] h-auto md:h-[512px] w-[512px] rounded-lg relative">
              <img src={mergedImage} className="h-full w-full object-contain" />
              <Animation
                playing={playing}
                setPlaying={setPlaying}
                config={animationConfig}
                loading={loading}
                setStrength={(v) => setStrength(v)}
              ></Animation>
              <div className="absolute -bottom-10 md:bottom-2 left-2 right-2 flex gap-2 z-50 flex-wrap">
                <div className="flex flex-auto gap-2 w-full md:w-auto">
                  <div className="text-xl text-zinc-100">AI</div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Slider
                        disabled={playing}
                        className="flex-1"
                        value={[strength]}
                        onValueChange={(v) => setStrength(v[0])}
                        max={animationConfig.max}
                        min={animationConfig.min}
                        step={animationConfig.step}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>AI strength</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex flex-auto md:flex-grow-0 gap-2 w-full md:w-auto">
                  <Select
                    value={preset.artist}
                    onValueChange={(value) =>
                      setPreset(
                        presetArtStyles.find((p) => p.artist === value)!,
                      )
                    }
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SelectTrigger className="flex-1 w-44 border-0 rounded bg-zinc-400 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                          <SelectValue placeholder="Select a fruit" />
                        </SelectTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Art style</p>
                      </TooltipContent>
                    </Tooltip>

                    <SelectContent>
                      {presetArtStyles.map((p) => (
                        <SelectItem key={p.artist} value={p.artist}>
                          {p.artist}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          setSeed(Math.floor(Math.random() * 2159232));
                        }}
                        className="flex-0 rounded bg-zinc-400 px-0.5 py-0.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      >
                        <Dice></Dice>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Random</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={image}
                        download
                        className="flex-0 block rounded bg-zinc-400 px-0.5 py-0.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      >
                        <Download />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          warmOrg(image, shareKey).then(() => {
                            navigator.clipboard.writeText(shareUrl).then(() => {
                              toast({
                                description: (
                                  <div className="flex gap-2 text-sm items-center">
                                    <Check className="text-green-500"></Check>
                                    Copied, paste to share
                                  </div>
                                ),
                              });
                            });
                          });
                        }}
                        className="flex-0 rounded bg-zinc-400 px-0.5 py-0.5 flex items-center justify-center text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      >
                        <Share2></Share2>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Share</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-8 items-center">
          <div className="flex items-center gap-2 mb-2">
            <FacebookShareButton
              beforeOnClick={() => warmOrg(image, shareKey)}
              url={shareUrl}
            >
              <FacebookIcon className="rounded" size={24}></FacebookIcon>
            </FacebookShareButton>
            <TwitterShareButton
              onClick={() => warmOrg(image, shareKey)}
              url={shareUrl}
            >
              <XIcon className="rounded" size={24} />
            </TwitterShareButton>
            <LinkedinShareButton
              onClick={() => warmOrg(image, shareKey)}
              url={shareUrl}
            >
              <LinkedinIcon className="rounded" size={24} />
            </LinkedinShareButton>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
