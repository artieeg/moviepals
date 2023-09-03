"use client";

import ReactMarkdown from "react-markdown";

export default function Terms() {
  return (
    <ReactMarkdown
      className="px-8"
      components={{
        h2: (node, ...props) => (
          <div
            className="font-secondary text-2xl font-bold text-neutral-1 dark:text-white mt-14"
            {...props}
          >
            {node.children}
          </div>
        ),
        li: (node, ...props) => (
          <div
            className="font-secondary opacity-70 leading-7 text-neutral-1 dark:text-white text-lg"
            {...props}
          >
            {node.children}
          </div>
        ),
        p: (node, ...props) => (
          <div
            className="font-secondary opacity-70 leading-7 text-neutral-1 dark:text-white text-lg"
            {...props}
          >
            {node.children}
          </div>
        ),
      }}
    >
      {terms}
    </ReactMarkdown>
  );
}

const terms = `
## Terms of Service

Welcome to MoviePals! These Terms of Service ("Terms") describe your rights and responsibilities when using our mobile application (the "App"). By using the App, you agree to these Terms.

## User Conduct

You are responsible for your use of the App and any content you post. You agree to use the App only for lawful purposes and to not use it to:

- Harass, threaten, or intimidate others
- Post content that is defamatory, obscene, or otherwise objectionable
- Violate any applicable laws or regulations

We reserve the right to remove any content that violates these Terms or is otherwise inappropriate.

## Movie Recommendations

Our App allows you to swipe on movies to pick something to watch together. Our recommendations are based on your preferences and viewing history. While we strive to provide accurate and relevant recommendations, we cannot guarantee that you will enjoy every movie that we suggest.

## Intellectual Property

All intellectual property rights in the App and its content, including trademarks, logos, and copyrights, are owned by MoviePals or its licensors. You may not use our intellectual property without our prior written consent.

## Termination

We may terminate your use of the App at any time for any reason, without notice to you. You may also terminate your use of the App at any time.

## Disclaimer of Warranties

The App and its content are provided "as is" and without warranty of any kind, express or implied. We do not warrant that the App will be uninterrupted or error-free, or that any defects will be corrected. We are not responsible for any damage to your device or loss of data that may result from your use of the App.

## Limitation of Liability

In no event shall MoviePals or its affiliates, licensors, or service providers be liable for any indirect, incidental, special, consequential, or punitive damages, arising out of or in connection with your use of the App.

## Governing Law

These Terms and your use of the App shall be governed by and construed in accordance with the laws of the state of California.

## Changes to Terms

We reserve the right to modify these Terms at any time. We will provide notice of any material changes to these Terms on the App. Your continued use of the App after the effective date of any changes to these Terms constitutes your acceptance of those changes.

## Contact Us

If you have any questions or concerns about these Terms or the App, please contact us at [hey@moviepals.com](mailto:hey@moviepals.com).
`;
