/*
 * Copyright (c) [2023-2024] SUSE LLC
 *
 * All Rights Reserved.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 2 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, contact SUSE LLC.
 *
 * To contact SUSE LLC about this file by physical or electronic mail, you may
 * find current contact information at www.suse.com.
 */

import React from "react";
import { plainRender } from "~/test-utils";
import { Icon } from "~/components/layout";

let consoleErrorSpy: jest.SpyInstance;

describe("Icon", () => {
  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, "error");
    consoleErrorSpy.mockImplementation();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("mounted with a known name", () => {
    it("renders an aria-hidden SVG element", async () => {
      const { container } = plainRender(<Icon name="wifi" />);
      const icon = container.querySelector("svg");
      expect(icon).toHaveAttribute("aria-hidden", "true");
    });

    it("includes the icon name as a data attribute of the SVG", async () => {
      const { container } = plainRender(<Icon name="wifi" />);
      const icon = container.querySelector("svg");
      expect(icon).toHaveAttribute("data-icon-name", "wifi");
    });
  });

  describe("mounted with unknown name", () => {
    it("outputs to console.error", () => {
      // @ts-expect-error: It's unlikely to happen, but let's test it anyway
      plainRender(<Icon name="apsens" />);
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining("'apsens' not found"));
    });

    it("renders nothing", async () => {
      // @ts-expect-error: It's unlikely to happen, but let's test it anyway
      const { container } = plainRender(<Icon name="apsens" />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("mounted with a falsy value as name", () => {
    it("outputs to console.error", () => {
      // @ts-expect-error: It's unlikely to happen, but let's test it anyway
      plainRender(<Icon name="" />);
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining("not found"));
    });

    it("renders nothing", () => {
      // @ts-expect-error: It's unlikely to happen, but let's test it anyway
      const { container: contentWhenEmpty } = plainRender(<Icon name="" />);
      expect(contentWhenEmpty).toBeEmptyDOMElement();

      // @ts-expect-error: It's unlikely to happen, but let's test it anyway
      const { container: contentWhenFalse } = plainRender(<Icon name={false} />);
      expect(contentWhenFalse).toBeEmptyDOMElement();

      const { container: contentWhenNull } = plainRender(<Icon name={null} />);
      expect(contentWhenNull).toBeEmptyDOMElement();
    });
  });
});
