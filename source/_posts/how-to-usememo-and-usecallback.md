title: 如何使用useMemo 和 useCallback：大部分情况下删掉就行了
date: 2022-08-18 14:54:07
categories: 翻译
tags: 

  - React
  - Hooks
  - 最佳实践
---

如果你对 React 不是完全陌生，你可能至少已经熟悉 useMemo 和 useCallback 钩子了。如果你在一个中大型规模的应用程序上工作，你很可能可以将应用程序的某些部分描述为“无法阅读和调试并难以理解的 useMemo 和 useCallbacks 链条”。这些钩子不知何故具有传播的能力, 不受控制地围绕代码，直到它们完全接管。您发现自己编写它们只是因为它们无处不在并且您周围的每个人都在编写它们。

你知道可悲的部分吗？所有这一切都是完全没有必要的。如果您现在删除应用程序中 90% 的 useMemo 和 useCallbacks，应用程序依然会很好，甚至可能会变得稍微快一些。不要误会，我并不是说 useMemo 或 useCallback 没用。只是它们的使用仅限于一些非常具体和具体的案例。大多数时候，我们在其中包装一些不必要的东西。

所以这就是我今天要讲的：开发者在使用useMemo和useCallback时会犯什么样的错误，它们的实际用途是什么，如何正确使用它们。

应用程序中这些钩子的有毒传播有两个主要来源：


- 记忆props以防止重新渲染
- 记忆值以避免每次重新渲染时进行费时的计算

我们将在本文后面介绍它们，但首先：useMemo 和 useCallback 的目的到底是什么？

## 为什么我们需要 useMemo 和 useCallback

答案很简单——重新渲染之间的记忆。如果一个值或一个函数被包装在这些钩子中，react 将在初始渲染期间缓存它，并在连续渲染期间返回对该保存值的引用。没有它，数组、对象或函数等非原始值将在每次重新渲染时从头开始重新创建。比较这些值时，记忆化很有用。这只是你的普通 javascript：

```javascript
const a = { "test": 1 };
const b = { "test": 1'};

console.log(a === b); // will be false

const c = a; // "c" is just a reference to "a"

console.log(a === c); // will be true
```

或者，如果更接近我们典型的 React 用例：

```react
const Component = () => {
  const a = { test: 1 };

  useEffect(() => {
    // "a" will be compared between re-renders
  }, [a]);

  // the rest of the code
};
```

值是 useEffect 钩子的依赖项。在每次重新渲染组件时，React 都会将其与之前的值进行比较。 a 是在组件中定义的对象，这意味着在每次重新渲染时，它将从头开始重新创建。因此，“重新渲染之前”与“重新渲染之后”的比较将返回 false，并且每次重新渲染都会触发 useEffect。

为了避免这种情况，我们可以将 a 值包装在 useMemo 钩子中：

```react
const Component = () => {
  // preserving "a" reference between re-renders
  const a = useMemo(() => ({ test: 1 }), []);

  useEffect(() => {
    // this will be triggered only when "a" value actually changes
  }, [a]);

  // the rest of the code
};
```

现在 useEffect 将仅在 a 值实际更改时触发（即在此实现中从不）。

与 useCallback 完全相同，只是它对记忆函数更有用：

```react
const Component = () => {
  // preserving onClick function between re-renders
  const fetch = useCallback(() => {
    console.log('fetch some data here');
  }, []);

  useEffect(() => {
    // this will be triggered only when "fetch" value actually changes
    fetch();
  }, [fetch]);

  // the rest of the code
};
```

这里要记住的最重要的事情是 useMemo 和 useCallback 都只在重新渲染阶段有用。在初始渲染期间，它们不仅无用，甚至有害：它们让 React 做一些额外的工作。这意味着您的应用在初始渲染期间会变得稍微慢一些。如果你的应用程序到处都有成百上千个，这种减速甚至是可以测量的。

## 记忆prop以防止重新渲染

现在我们知道了这些钩子的用途，让我们来看看它们的实际用法。其中最重要且最常用的一种是记忆道具值以防止重新渲染。如果您在应用程序的某处看到以下代码，请发出一些声音：

1. 必须在 useCallback 中包装 onClick 以防止重新渲染

```react
const Component = () => {
  const onClick = useCallback(() => {
    /* do something */
  }, []);
  return (
    <>
      <button onClick={onClick}>Click me</button>
      ... // some other components
    </>
  );
};
```

2. 必须在 useCallback 中包装 onClick 以防止重新渲染

```react
const Item = ({ item, onClick, value }) => <button onClick={onClick}>{item.name}</button>;

const Component = ({ data }) => {
  const value = { a: someStateValue };

  const onClick = useCallback(() => {
    /* do something on click */
  }, []);

  return (
    <>
      {data.map((d) => (
        <Item item={d} onClick={onClick} value={value} />
      ))}
    </>
  );
};
```

3. 必须将 value 包装在 useMemo 中，因为它是 memoized onClick 的依赖项：

```react
const Item = ({ item, onClick }) => <button onClick={onClick}>{item.name}</button>;

const Component = ({ data }) => {
  const value = useMemo(() => ({ a: someStateValue }), [someStateValue]);
  const onClick = useCallback(() => {
    console.log(value);
  }, [value]);

  return (
    <>
      {data.map((d) => (
        <Item item={d} onClick={onClick} />
      ))}
    </>
  );
};
```

这是您做过的事情或看到您周围的其他人做的事情吗？你同意这个用例以及钩子是如何解决它的吗？如果这些问题的答案是“是”，那么恭喜：useMemo 和 useCallback 把你当作人质并不必要地控制了你的生活。在所有示例中，这些钩子都是无用的，不必要的复杂代码，会减慢初始渲染速度并且什么也不会阻止。

要理解为什么，我们需要记住 React 是如何工作的一件重要的事情：组件可以重新渲染自身的原因。

## 为什么组件可以重新渲染自己？

“当状态或属性值发生变化时，组件会重新渲染自己”是常识。甚至 React 文档也是这样表述的。而且我认为这个陈述正是导致错误结论的原因，即“如果属性不改变（即记忆化），那么它将阻止组件重新渲染”。

因为组件重新渲染还有一个非常重要的原因：当它的父级重新渲染自己时。或者，如果我们从相反的方向出发：当一个组件重新渲染它自己时，它也会重新渲染它的所有子组件。例如看一下这段代码：

```react
const App = () => {
  const [state, setState] = useState(1);

  return (
    <div className="App">
      <button onClick={() => setState(state + 1)}> click to re-render {state}</button>
      <br />
      <Page />
    </div>
  );
};
```

App 组件有一些状态和一些子组件，包括 Page 组件。单击此处的按钮会发生什么？状态会改变，它将触发 App 的重新渲染，这将触发其所有子组件的重新渲染，包括 Page 组件。它甚至没有道具！

现在，在这个 Page 组件内部，如果我们也有一些子组件：

```react
const Page = () => <Item />;
```

完全是空的，它既没有状态也没有道具。但是它的重新渲染会在 App 重新渲染时触发，因此会触发其 Item 子项的重新渲染。应用程序组件状态更改会触发整个应用程序的重新渲染链。[请参阅此codesandbox中的完整示例](https://codesandbox.io/s/parent-children-re-renders-gihtcw?file=/src/App.tsx)。

中断这个链的唯一方法是记住其中的一些组件。我们可以使用 useMemo 挂钩，或者更好的是，使用 React.memo util。只有当组件被包裹起来时，React 才会在重新渲染之前停止并检查 props 值是否发生变化。

记忆组件：

```react
const Page = () => <Item />;
const PageMemoized = React.memo(Page);
```

在状态更改的应用程序中使用它：

```react
const App = () => {
  const [state, setState] = useState(1);

  return (
    ... // same code as before
      <PageMemoized />
  );
};
```

在这种情况下，只有在这种情况下，属性是否被记忆是很重要的

为了说明，让我们假设 Page 组件具有接受函数的 onClick 属性。如果我在没有先记忆它的情况下将它传递给 Page 会发生什么？

```react
const App = () => {
  const [state, setState] = useState(1);
  const onClick = () => {
    console.log('Do something on click');
  };
  return (
    // page will re-render regardless of whether onClick is memoized or not
    <Page onClick={onClick} />
  );
};
```

App 会重新渲染，React 会在它的子节点中找到 Page，然后重新渲染它。 onClick 是否包含在 useCallback 中是无关紧要的。

如果我memoize Page呢？

````react
const PageMemoized = React.memo(Page);

const App = () => {
  const [state, setState] = useState(1);
  const onClick = () => {
    console.log('Do something on click');
  };
  return (
    // PageMemoized WILL re-render because onClick is not memoized
    <PageMemoized onClick={onClick} />
  );
};
````

App 会重新渲染，React 会在它的 children 中找到 PageMemoized，意识到它被包裹在 React.memo 中，停止重新渲染链，并首先检查这个组件上的 props 是否改变。在这种情况下，由于 onClick 是一个 not memoized 函数，props 比较的结果会失败，PageMemoized 会重新渲染自己。最后，一些useCallback的用法：

```react
const PageMemoized = React.memo(Page);

const App = () => {
  const [state, setState] = useState(1);
  const onClick = useCallback(() => {
    console.log('Do something on click');
  }, []);

  return (
    // PageMemoized will NOT re-render because onClick is memoized
    <PageMemoized onClick={onClick} />
  );
};
```

现在，当 React 停止在 PageMemoized 上检查其 props 时，onClick 将保持不变，并且不会重新渲染 PageMemoized。

如果我向 PageMemoized 添加另一个非记忆值会发生什么？完全相同的场景：

```react
const PageMemoized = React.memo(Page);

const App = () => {
  const [state, setState] = useState(1);
  const onClick = useCallback(() => {
    console.log('Do something on click');
  }, []);

  return (
    // page WILL re-render because value is not memoized
    <PageMemoized onClick={onClick} value={[1, 2, 3]} />
  );
};
```

React 在 PageMemoized 上停止检查它的 props，onClick 将保持不变，但值会改变，并且 PageMemoized 将重新渲染自己。请参阅此处的[完整示例](https://codesandbox.io/s/everything-memoized-8oltqg?file=/src/App.tsx)，尝试删除 memoization 以查看所有内容如何重新开始重新渲染。

考虑到上述情况，只有一种情况，当在组件上记忆 props 是有意义的：当每个单独的 props 和组件本身都被记忆时。其他一切都只是浪费内存并且不必要地使您的代码复杂化

如果出现以下情况，请随意从代码中删除所有 useMemo 和 useCallbacks：

- 它们作为attribute直接或通过依赖链传递给 DOM 元素
- 它们作为Props直接或通过依赖链传递给未记忆的组件
- 它们作为 props 直接或通过一系列依赖项传递给一个组件，其中至少有一个 prop 没有被记忆

为什么要删除，而不仅仅是修复记忆？好吧，如果您因为该区域的重新渲染而遇到性能问题，您会注意到并修复它，不是吗？ 😉 而且由于没有性能问题，所以没有必要修复它。删除无用的 useMemo 和 useCallback 将简化代码并稍微加快初始渲染速度，而不会对现有的重新渲染性能产生负面影响。



## 避免在每次渲染时进行费时的计算

根据 React 文档，`useMemo` 的主要目标是避免在每次渲染时进行费时的计算。尽管没有暗示什么构成“费时”的计算。因此，开发人员有时会将渲染函数中的几乎所有计算都包含在 `useMemo` 中。创建一个新日期？过滤、映射或排序数组？创建对象？所有都上useMemo！

好吧，让我们来看看一些数字。想象一下，我们有一系列国家（大约 250 个），我们希望将它们呈现在屏幕上并允许用户对它们进行排序。

问题是：对包含 250 个元素的数组进行排序是一项费时的操作吗？感觉像，不是吗？我们可能应该将它包装在 useMemo 中以避免在每次重新渲染时重新计算它，对吧？嗯，很容易测量：

```react
const List = ({ countries }) => {
  const before = performance.now();

  const sortedCountries = orderBy(countries, 'name', sort);

  // this is the number we're after
  const after = performance.now() - before;

  return (
    // same
  )
};
```

最终结果？如果没有使用useMemo，6核 CPU ，对这个包含约 250 个项目的数组进行排序只需不到 2 毫秒。相比之下，呈现这个列表——只是带有文本的原生按钮——需要超过 20 毫秒。 10倍以上！请参阅[codesandbox](https://codesandbox.io/s/measure-without-memo-tnhggk?file=/src/page.tsx)。

而在现实生活中，数组可能会更小，而且渲染得更复杂，因此更慢。所以性能上的差异甚至会大于10倍。

我们应该记住这里实际最费时的计算——重新渲染和更新组件，而不是记住数组操作。像这样的东西：

```react
const List = ({ countries }) => {
  const content = useMemo(() => {
    const sortedCountries = orderBy(countries, 'name', sort);

    return sortedCountries.map((country) => <Item country={country} key={country.id} />);
  }, [countries, sort]);

  return content;
};
```

useMemo 将整个组件的不必要的重新渲染时间从大约 20 毫秒降至不到 2 毫秒。

考虑到上述情况，这是我要介绍的关于记忆“费时”操作的规则：除非您实际计算大数的阶乘，否则请删除所有纯 JavaScript 操作上的 useMemo 钩子。重新渲染子组件永远是你的瓶颈。仅使用 useMemo 来记忆渲染树的重要部分。

**为什么要删除？**把所有东西都记下来不是更好吗？如果我们将它们全部删除，这不是会降低性能的复合效应吗？这里 1 毫秒，那里 2 毫秒，很快我们的应用程序就没有它应该的那么快了……

有道理。如果不是因为一个警告，这种想法将是 100% 有效的：记忆不是免费的。如果我们使用 useMemo，在初始渲染期间，React 需要缓存结果值——这需要时间。是的，它会很小，在我们上面的应用程序中，记住这些排序的国家需要不到一毫秒的时间。但！这将是真正的复合效应。初始渲染发生在您的应用首次出现在屏幕上时。每个应该显示的组件都会通过它。在具有数百个组件的大型应用程序中，即使其中三分之一的组件记住了某些内容，也可能导致初始渲染增加 10 毫秒、20 毫秒，最坏的情况甚至可能是 100 毫秒。

另一方面，重新渲染仅在应用程序的某个部分发生更改后才会发生。在一个架构良好的应用程序中，只有这个特定的小部分会被重新渲染，而不是整个应用程序。有多少与上述案例类似的“计算”在那个变化的部分中有多少？ 2-3？假设是 5。每次记忆将节省我们不到 2 毫秒，即总体不到 10 毫秒。 10 毫秒可能会发生也可能不会发生（取决于触发它的事件是否发生），肉眼看不到，并且会在子元素重新渲染中丢失，无论如何这将花费 10 倍。以减慢总是会发生的初始渲染为代价😔。

## 今天到此为止

这是需要处理的大量信息，希望您发现它有用，并且现在渴望审查您的应用程序并摆脱所有无用的 useMemo 和 useCallback 意外接管您的代码。在你离开前快速总结并巩固知识：

- useCallback 和 useMemo 是仅对连续渲染（即重新渲染）有用的钩子，对于初始渲染它们实际上是有害的
- 用于 props 的 useCallback 和 useMemo 本身并不会阻止重新渲染。只有当每个道具和组件本身都被记忆时，才能防止重新渲染。一个错误，一切都崩溃了，使那些钩子毫无用处。如果找到它们，请删除它们。
- 移除围绕“原生”javascript 操作的 useMemo - 与不可见的组件更新相比，在初始渲染期间只会占用额外的内存和宝贵的时间

一件小事：考虑到这一切的复杂性和脆弱性，useMemo 和 useCallback 性能优化确实应该是你最后的手段。首先尝试其他性能优化技术。看看那些描述其中一些的文章：

- [如何编写高性能的 React 代码：规则、模式、注意事项](https://www.developerway.com/posts/how-to-write-performant-react-code)
- [为什么自定义反应钩子会破坏您的应用程序性能](https://www.developerway.com/posts/why-custom-react-hooks-could-destroy-your-app-performance)
- [如何使用 Context 编写高性能的 React 应用程序](https://www.developerway.com/posts/how-to-write-performant-react-apps-with-context)
- React 关键属性：性能列表的最佳实践](https://www.developerway.com/posts/react-key-attribute)
- [React 组件组合：如何正确使用](https://www.developerway.com/posts/components-composition-how-to-get-it-right)

当然，不用说：先测量！

愿这一天成为您使用 useMemo 和 useCallback 的最后一天！ ✌🏼