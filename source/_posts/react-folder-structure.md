title: React项目的目录结构规划[2022]
date: 2022-07-16 09:23
categories: 翻译
tags: 
	- React

---



> 该文章翻译自 https://www.robinwieruch.de/react-folder-structure/



如何规划大型React应用的目录结构是一个非常有争议的话题。我在写这个话题时挣扎了一段时间，因为没有正确的方法。然而，每隔一周就有人问我如何架构我的React项目--从小型到大型React项目的文件夹结构。


在实施了几年的React应用之后，我想给你分析一下我是如何为我的个人项目、自由职业者项目和React大型工程处理这件事的。这只需要5个步骤，你决定什么对你有意义，你想把它推到什么程度。所以，让我们开始吧。


对于那些说 "我到处移动文件，直到感觉合适为止 "的人。作为一个单独的开发者，这可能是没问题的，但在一个由4个开发者组成的跨职能团队中，你真的会这样做吗？在更高规模的团队中，"在没有明确愿景的情况下随便移动文件 "会变得很棘手。此外，当我的咨询客户问我这个问题时，这也是我无法告诉他们的。因此，对于任何想了解这个问题的人来说，请把这个演练作为参考指南。

## 单个React文件



第一步遵循的规则是。用一个文件来包含所有内容。大多数React项目从一个src/文件夹和一个带有App组件的src/App.js文件开始。至少这是你在使用[create-react-app](https://www.robinwieruch.de/react-js-macos-setup/)时得到的东西。这是一个用于渲染JSX的[函数组件](https://www.robinwieruch.de/react-function-component/)。

```jsx
import * as React from 'react';

const App = () => {
  const title = 'React';

  return (
    <div>
      <h1>Hello {title}</h1>
    </div>
  );
}

export default App;
```

最终，这个组件增加了更多的功能，它的规模自然会增长，需要提取其中的部分作为独立的React组件。在这里，我们正在从App组件中提取一个React列表组件与另一个子组件。

```jsx
import * as React from 'react';

const list = [
  {
    id: 'a',
    firstname: 'Robin',
    lastname: 'Wieruch',
    year: 1988,
  },
  {
    id: 'b',
    firstname: 'Dave',
    lastname: 'Davidds',
    year: 1990,
  },
];
const App = () => <List list={list} />;
const List = ({ list }) => (
  <ul>
    {list.map(item => (
      <ListItem key={item.id} item={item} />
    ))}
  </ul>
);
const ListItem = ({ item }) => (
  <li>
    <div>{item.id}</div>
    <div>{item.firstname}</div>
    <div>{item.lastname}</div>
    <div>{item.year}</div>
  </li>
);
```

每当你开始一个新的React项目时，我都会告诉人们，在一个文件中拥有多个组件是没有问题的。在一个较大的React应用中，只要一个组件与另一个组件严格紧贴，这甚至是可以容忍的。然而，在这种情况下，最终这一个文件对你的React项目来说已经不够用了。这就是我们过渡到第二步的时候。

## 多个React文件

第二步遵循规则。多个文件来管理它们。以我们之前的App组件及其List和ListItem组件为例。与其把所有东西都放在一个 src/App.js 文件中，我们可以把这些组件分成多个文件。在这里，你可以决定你想走多远。例如，我将采用以下的文件夹结构。

```
- src/
--- App.js
--- List.js
```

虽然src/List.js文件会有List和ListItem两个组件，但它只会从文件中导出List组件作为该文件的公共API。

```jsx
const List = ({ list }) => (
  <ul>
    {list.map(item => (
      <ListItem key={item.id} item={item} />
    ))}
  </ul>
);

const ListItem = ({ item }) => (
  <li>
    <div>{item.id}</div>
    <div>{item.firstname}</div>
    <div>{item.lastname}</div>
    <div>{item.year}</div>
  </li>
);

export { List };
```

接下来src/App.js文件可以导入List组件并使用它。

```jsx
import * as React from 'react';

import { List } from './List';

const list = [ ... ];

const App = () => <List list={list} />;
```

如果你想更进一步，你也可以将ListItem组件提取到自己的文件中，让List组件导入ListItem组件。

```
- src/
--- App.js
--- List.js
--- ListItem.js
```

然而，正如之前所说，这可能走得太远了，因为此时ListItem组件与List组件是紧密耦合的，因此把它留在src/List.js文件中是可以的。我遵循的经验法则是，只要一个React组件成为一个可重用的React组件，我就会把它拆成一个独立的文件，就像我们对List组件所做的那样，以使其他React组件能够访问它。



## 从React文件到React目录

从这里开始，它变得更加有趣但也更加有主见。每个React组件最终都会变得越来越复杂。不仅是因为添加了更多的逻辑（例如，更多的JSX与条件渲染或React Hooks和事件处理程序的逻辑），而且还因为有更多的技术问题，如样式和测试。一个天真的方法是在每个React组件旁边添加更多的文件。例如，我们假设每个React组件都有一个测试和一个样式文件。

```
- src/
--- App.js
--- App.test.js
--- App.css
--- List.js
--- List.test.js
--- List.css
```

人们已经可以看到，这并不能很好地扩展，因为在src/文件夹中每增加一个组件，我们就会失去更多对每个单独组件的关注。这就是为什么我喜欢为每个React组件建立一个文件夹。

```
- src/
--- App/
----- index.js
----- component.js
----- test.js
----- style.css
--- List/
----- index.js
----- component.js
----- test.js
----- style.css
```

新的样式和测试文件分别实现了每个本地组件的样式和测试，而新的component.js文件保存了组件的实际实现逻辑。新的index.js文件，它代表文件夹的公共接口，所有与外界相关的东西都被导出。例如，对于List组件来说，它通常看起来像这样。

```js
export * from './List';
```

App组件在其component.js文件中仍然可以通过以下方式导入List组件。

```js
import { List } from '../List/index.js';
```

在JavaScript中，我们可以省略导入的/index.js，因为它是默认的。

```js
import { List } from '../List';
```

这些文件的命名已经有了意见。例如，如果需要文件的复数化，test.js可以变成spec.js，style.css可以变成style.css。此外，如果你使用的不是CSS，而是类似于[Styled Components](https://www.robinwieruch.de/styled-components/)的东西，你的文件扩展名也可以从style.css变成style.js。

一旦你习惯了这种文件夹和文件的命名方式，你就可以在IDE中搜索 "List component "或 "App test "来打开每个文件。在此，我承认与我个人喜欢简洁的文件名相反，人们往往喜欢在文件名上更啰嗦一点。

```
- src/
--- App/
----- index.js
----- App.js
----- App.test.js
----- App.style.css
--- List/
----- index.js
----- List.js
----- List.test.js
----- List.style.css
```

总之，如果你把所有的组件文件夹折叠起来，不管文件名是什么，你就会有一个非常简明清晰的文件夹结构。

```
- src/
--- App/
--- List/
```

如果对一个组件有更多的技术关注，例如你可能想把自定义钩子、类型（如TypeScript定义的类型）、故事（如Storybook）、实用工具（如辅助函数）或常量（如JavaScript常量）提取到专门的文件中，你可以在组件文件夹中横向扩展这种方法。

```
- src/
--- App/
----- index.js
----- component.js
----- test.js
----- style.css
----- types.js
--- List/
----- index.js
----- component.js
----- test.js
----- style.css
----- hooks.js
----- story.js
----- types.js
----- utils.js
----- constants.js
```

如果你决定通过将ListItem组件提取到自己的文件中来保持你的List/component.js更加轻量级，那么你可能想尝试以下的文件夹结构。

```
- src/
--- App/
----- index.js
----- component.js
----- test.js
----- style.css
--- List/
----- index.js
----- component.js
----- test.js
----- style.css
----- ListItem.js
```

在这里，你可以再进一步，给组件一个自己的嵌套文件夹，其中包含所有其他技术问题，如测试和样式。

```
- src/
--- App/
----- index.js
----- component.js
----- test.js
----- style.css
--- List/
----- index.js
----- component.js
----- test.js
----- style.css
----- ListItem/
------- index.js
------- component.js
------- test.js
------- style.css
```

重要的是。从这里开始，你需要注意不要让你的组件互相嵌套得太深。我的经验法则是，我永远不会将组件嵌套到两层以上，所以List和ListItem文件夹现在的样子是可以的，但ListItem的文件夹不应该有另一个嵌套文件夹。

如果你是正在处理中型React项目，在我看来，这就是组织你的React组件的方式。根据我作为React自由职业者的经验，许多React项目都遵循这种React应用程序的组织方式。

## 技术文件夹

下一步将帮助你构建中型到大型的React应用程序。它将React组件与可重用的React工具（如钩子和上下文）分开，但也没有React相关的工具，如辅助函数（这里是services/）。以下面这个文件夹结构的基础为例。

```
- src/
--- components/
----- App/
------- index.js
------- component.js
------- test.js
------- style.css
----- List/
------- index.js
------- component.js
------- test.js
------- style.css
```

所有以前的React组件都被分组到一个新的组件/文件夹中。这给了我们另一个垂直层，用于为其他技术类别创建文件夹。例如，在某些时候，你可能有可重用的React钩子，可以被一个以上的组件使用。因此，与其把一个自定义钩子紧紧地耦合到一个组件上，你可以把它的实现放在一个专门的文件夹里，可以被所有的React组件使用。

```
- src/
--- components/
----- App/
------- index.js
------- component.js
------- test.js
------- style.css
----- List/
------- index.js
------- component.js
------- test.js
------- style.css
--- hooks/
----- useClickOutside.js
----- useScrollDetect.js
```

但这并不意味着所有的钩子都应该在这个文件夹中结束。只被一个组件使用的React钩子应该留在该组件的文件中，或者在组件的文件夹中，在该组件旁边有一个hooks.js文件。只有可重用的钩子才会在新的hooks/文件夹中结束。如果一个钩子需要更多的文件，你可以再把它改成一个文件夹。

```
- src/
--- components/
----- App/
------- index.js
------- component.js
------- test.js
------- style.css
----- List/
------- index.js
------- component.js
------- test.js
------- style.css
--- hooks/
----- useClickOutside/
------- index.js
------- hook.js
------- test.js
----- useScrollDetect/
------- index.js
------- hook.js
------- test.js
```

如果你在React项目中使用React Context，同样的策略也适用。因为上下文需要在某个地方被实例化，为它建立一个专门的文件夹/文件是最好的做法，因为它最终需要被许多React组件访问。

```
- src/
--- components/
----- App/
------- index.js
------- component.js
------- test.js
------- style.css
----- List/
------- index.js
------- component.js
------- test.js
------- style.css
--- hooks/
----- useClickOutside.js
----- useScrollDetect.js
--- context/
----- Session.js
```



在这里，可能有其他的实用程序需要从你的 components/ 文件夹中访问，但也可以从其他新的文件夹中访问，比如hooks/ 和 context/。对于杂七杂八的实用程序，我通常创建一个services/文件夹。名称由你决定（例如，utils/是我经常看到的另一个文件夹名称，但services对下面的导入策略更有意义）。但是，这也是让我们项目中的其他代码可以使用逻辑的原则，这也是这种技术分离的动力。

```text
- src/
--- components/
----- App/
------- index.js
------- component.js
------- test.js
------- style.css
----- List/
------- index.js
------- component.js
------- test.js
------- style.css
--- hooks/
----- useClickOutside.js
----- useScrollDetect.js
--- context/
----- Session.js
--- services/
----- ErrorTracking/
------- index.js
------- service.js
------- test.js
----- Format/
------- Date/
--------- index.js
--------- service.js
--------- test.js
------- Currency/
--------- index.js
--------- service.js
--------- test.js
```

以Date/index.js文件为例。实现的细节可能如下。

```jsx
export const formatDateTime = (date) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).format(date);


export const formatMonth = (date) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'long',
  }).format(date);
```

幸运的是，[JavaScript's International API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)为我们提供了优秀的日期转换工具。然而，我不想在我的React组件中直接使用API，而是希望有一个服务，因为只有这样，我才能保证我的组件只有一小部分常用的日期格式化选项可用于我的应用程序。

现在，我们不仅可以单独导入每个日期格式化功能。

```jsx
import { formatMonth } from '../../services/format/date';

const month = formatMonth(new Date());
```

还可以作为一个服务，作为一个封装的模块，换句话说，我通常喜欢这样做。

```jsx
import * as dateService from '../../services/format/date';

const month = dateService.formatMonth(new Date());
```

现在导入相对路径的东西可能变得很困难。因此，我总是会选择使用Babel的模块解析器来获取别名。之后，你的导入可能看起来像下面这样。

```jsx
import * as dateService from 'format/date';

const month = dateService.formatMonth(new Date());
```

毕竟，我喜欢这种技术上的分离，因为它给每个文件夹一个专门的用途，而且它鼓励在整个React应用程序中共享功能。

## 功能文件夹

最后一步将帮助你构建大型React应用程序，因为它将特定的功能相关的组件与通用的UI组件分开。前者在React项目中通常只使用一次，而后者是被多个组件使用的UI组件。

在这里，为了保持例子的小规模，我将专注于组件，然而，同样的学习可以应用于上一节中的其他技术文件夹。以下面的文件夹结构为例，它可能没有显示出问题的全部范围，但我希望你能明白这一点。

```text
- src/
--- components/
----- App/
----- List/
----- Input/
----- Button/
----- Checkbox/
----- Radio/
----- Dropdown/
----- Profile/
----- Avatar/
----- MessageItem/
----- MessageList/
----- PaymentForm/
----- PaymentWizard/
----- ErrorMessage/
----- ErrorBoundary/
```

关键是。在你的组件/最终会有太多的组件。其中一些是可重复使用的（如Button），而另一些则与功能有关（如Message）。

从这里开始，我将只把 components/ 文件夹用于可重用的组件（如 UI 组件）。其他每个组件都应该移到各自的功能文件夹中。文件夹的名称也由你决定。

```text
- src/
--- feature/
----- User/
------- Profile/
------- Avatar/
----- Message/
------- MessageItem/
------- MessageList/
----- Payment/
------- PaymentForm/
------- PaymentWizard/
----- Error/
------- ErrorMessage/
------- ErrorBoundary/
--- components/
----- App/
----- List/
----- Input/
----- Button/
----- Checkbox/
----- Radio/
----- Dropdown/
```

如果一个功能组件（如MessageItem、PaymentForm）需要访问共享的Checkbox、Radio或Dropdown组件，它就从可重用的UI组件文件夹中导入。如果一个特定领域的MessageList组件需要一个抽象的List组件，它也会将其导入。

此外，如果上一节中的一个服务与某个功能紧密耦合，那么就把该服务移到特定的功能文件夹中。同样的情况也可能适用于之前因技术问题而分开的其他文件夹。

```text
- src/
--- feature/
----- User/
------- Profile/
------- Avatar/
----- Message/
------- MessageItem/
------- MessageList/
----- Payment/
------- PaymentForm/
------- PaymentWizard/
------- services/
--------- Currency/
----------- index.js
----------- service.js
----------- test.js
----- Error/
------- ErrorMessage/
------- ErrorBoundary/
------- services/
--------- ErrorTracking/
----------- index.js
----------- service.js
----------- test.js
--- components/
--- hooks/
--- context/
--- services/
----- Format/
------- Date/
--------- index.js
--------- service.js
--------- test.js
```

在每个feature文件夹中是否应该有一个 service文件夹，这取决于你。你也可以不设这个文件夹，直接把ErrorTracking/文件夹放到Error/中。然而，这可能会引起混淆，因为ErrorTracking应该以某种方式被标记为一个服务，而不是一个React组件。

这里有很大的空间让你进行个性化的处理。毕竟，这一步只是把功能集中在一起，这允许你公司的团队在特定的功能上工作，而不必在整个项目中接触文件。

## 奖励:文件夹/文件的命名规则

在我们拥有像React.js这样的基于组件的UI库之前，我们习惯于用kebab-case命名规则来命名我们所有的文件夹和文件。在Node.js世界里，这仍然是现状的命名惯例。然而，在有基于组件的用户界面库的前端，对于包含组件的文件夹/文件，这种命名惯例变为PascalCase，因为当声明一个组件时，它也遵循PascalCase的命名惯例。

```text
--- feature/
----- user/
------- profile/
------- avatar/
----- message/
------- message-item/
------- message-list/
----- payment/
------- payment-form/
------- payment-wizard/
----- error/
------- error-message/
------- error-boundary/
--- components/
----- app/
----- list/
----- input/
----- button/
----- checkbox/
----- radio/
----- dropdown/
```

就像上面的例子一样，在一个完美的世界里，我们会对所有的文件夹和文件使用kebab-case的命名规则，因为PascalCase命名的文件夹/文件在操作系统的多样性中处理方式不同，这可能会导致与使用不同操作系统的团队合作时出现bug。

## 奖励:Next.js项目结构

一个Next.js项目以一个pages/文件夹开始。这里有一个常见的问题。把src/文件夹放在哪里？

```text
- api/
- pages/
- src/
--- feature/
--- components/
```

通常情况下，src文件夹会在page文件夹的旁边被创建。在这里，你可以遵循之前讨论过的src/文件夹内的文件夹/文件结构。我听说Next.js中有一个逃生通道，你可以把pages/文件夹也放在src/文件夹中。



```text
- api/
- src/
--- pages/
--- feature/
--- components/
```

但是，在这种情况下，不允许再有pages/文件夹。



写了这么多，我希望能帮助某个人或团队构建他们的React项目。请记住，所显示的方法中没有一个是固定的。相反，我鼓励你在其中运用你的个人风格。由于每个React项目的规模都会随着时间的推移而增长，大多数的文件夹结构也会非常自然地演变。因此，如果事情失去控制，5个步骤的过程可以给你一些指导。
