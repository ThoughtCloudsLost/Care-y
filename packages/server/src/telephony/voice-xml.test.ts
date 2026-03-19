import { describe, it, expect } from "vitest";
import type { VoiceInstruction } from "./provider.js";
import { ValidationError } from "../errors.js";
import { escapeXml, renderInstruction, renderVoiceXml } from "./voice-xml.js";

describe("escapeXml", () => {
  it("escapes all 5 XML entities", () => {
    expect(escapeXml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&apos;");
  });

  it("leaves plain text unchanged", () => {
    expect(escapeXml("hello world")).toBe("hello world");
  });
});

describe("renderInstruction", () => {
  it("renders say with text body", () => {
    const inst: VoiceInstruction = {
      type: "say",
      attributes: { text: "Hello" },
    };
    expect(renderInstruction(inst)).toBe("<Say>Hello</Say>");
  });

  it("renders say with text and voice attribute", () => {
    const inst: VoiceInstruction = {
      type: "say",
      attributes: { text: "Hello", voice: "alice" },
    };
    expect(renderInstruction(inst)).toBe('<Say voice="alice">Hello</Say>');
  });

  it("renders say with attributes but no text", () => {
    const inst: VoiceInstruction = {
      type: "say",
      attributes: { voice: "alice", language: "en-US" },
    };
    expect(renderInstruction(inst)).toBe(
      '<Say voice="alice" language="en-US"></Say>',
    );
  });

  it("renders self-closing hangup", () => {
    const inst: VoiceInstruction = { type: "hangup" };
    expect(renderInstruction(inst)).toBe("<Hangup/>");
  });

  it("renders self-closing pause with attributes", () => {
    const inst: VoiceInstruction = {
      type: "pause",
      attributes: { length: "2" },
    };
    expect(renderInstruction(inst)).toBe('<Pause length="2"/>');
  });

  it("renders self-closing record", () => {
    const inst: VoiceInstruction = { type: "record" };
    expect(renderInstruction(inst)).toBe("<Record/>");
  });

  it("renders gather with nested say child", () => {
    const inst: VoiceInstruction = {
      type: "gather",
      children: [{ type: "say", attributes: { text: "Press 1" } }],
    };
    expect(renderInstruction(inst)).toBe("<Gather><Say>Press 1</Say></Gather>");
  });

  it("renders dial with children", () => {
    const inst: VoiceInstruction = {
      type: "dial",
      children: [{ type: "say", attributes: { text: "Connecting" } }],
    };
    expect(renderInstruction(inst)).toBe("<Dial><Say>Connecting</Say></Dial>");
  });

  it("escapes XML entities in text body", () => {
    const inst: VoiceInstruction = {
      type: "say",
      attributes: { text: `Tom & Jerry say "hello" <world> it's fine` },
    };
    expect(renderInstruction(inst)).toBe(
      "<Say>Tom &amp; Jerry say &quot;hello&quot; &lt;world&gt; it&apos;s fine</Say>",
    );
  });

  it("throws ValidationError for unknown instruction type", () => {
    const inst = { type: "unknown_verb" } as unknown as VoiceInstruction;
    expect(() => renderInstruction(inst)).toThrow(ValidationError);
  });
});

describe("renderVoiceXml", () => {
  it("renders single say instruction with XML declaration", () => {
    const instructions: VoiceInstruction[] = [
      { type: "say", attributes: { text: "Hello" } },
    ];
    expect(renderVoiceXml(instructions)).toBe(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Say>Hello</Say></Response>',
    );
  });

  it("renders empty instructions array", () => {
    expect(renderVoiceXml([])).toBe(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
    );
  });

  it("renders custom root element", () => {
    const instructions: VoiceInstruction[] = [{ type: "hangup" }];
    expect(renderVoiceXml(instructions, "CustomRoot")).toBe(
      '<?xml version="1.0" encoding="UTF-8"?><CustomRoot><Hangup/></CustomRoot>',
    );
  });

  it("renders multiple instructions in sequence", () => {
    const instructions: VoiceInstruction[] = [
      { type: "say", attributes: { text: "Welcome" } },
      { type: "pause", attributes: { length: "1" } },
      { type: "say", attributes: { text: "Goodbye" } },
      { type: "hangup" },
    ];
    expect(renderVoiceXml(instructions)).toBe(
      '<?xml version="1.0" encoding="UTF-8"?><Response>' +
        "<Say>Welcome</Say>" +
        '<Pause length="1"/>' +
        "<Say>Goodbye</Say>" +
        "<Hangup/>" +
        "</Response>",
    );
  });
});
