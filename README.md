<!-- markdownlint-configure-file {
  "MD013": false,
  "MD033": false,
  "MD041": false
} -->

<div align="center">

<hr />

<img src="./public/logo-light.svg" alt="interviews logo">

# Interviews

[![interviews.so][interviews.so-badge]][interviews.so]

[Interviews](https://interviews.so) is a library of real-world programming scenarios to use as technical interviews.

**No leetcode or algorithm based questions.**

[About](#about-interviews) •
[Developing](#developing) •
[Contributing](#contributing)

</div>

## About Interviews

**Interviews** was created to help companies hire developers based on real-world scenarios — i.e. things a developer could do on a normal day, not runtime and algorithm puzzles. The questions are designed to be open-ended and allow the candidate to demonstrate their knowledge and experience.

We also provide [a blog](https://interviews.so/blog) that covers topics related to interviewing and how to get the most out of your interviews. Those articles are found in the [docs](./content/blog) folder.

This repo is the source code for the [interviews.so](https://interviews.so) website. If you're looking for the library of questions, you can find free scenarios [here](https://github.com/interviews-so). The full library is available to [members](https://interviews.so/login).

## Developing

This is a Nextjs app based on [Taxonomy](https://github.com/shadcn/taxonomy).

Setup the environment variables:

```sh
mv .env.example .env.local
```

Fill in the required values.

Install dependencies and run the development server:

```sh
npm install
npm run dev
```

## Contributing

We welcome contributions to our blog, website, and library of questions. Please see the [contributing guide](./CONTRIBUTING.md) for more information. **All contributions will always be free and open-source.**

[interviews.so-badge]: https://img.shields.io/website?url=https%3A%2F%2Finterviews.so
[interviews.so]: https://interviews.so
