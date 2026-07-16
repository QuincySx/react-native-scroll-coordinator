import {
  createContext,
  createElement,
  isValidElement,
  type ComponentType,
  type ReactElement,
  type ReactNode,
  useContext,
  useMemo,
} from 'react';

type ListHeader = ComponentType<unknown> | ReactElement | null | undefined;

const CoordinatorWebContext = createContext<ReactElement | null>(null);

export function CoordinatorWebProvider({
  children,
  chrome,
}: {
  children: ReactNode;
  chrome: ReactElement;
}) {
  return (
    <CoordinatorWebContext.Provider value={chrome}>
      {children}
    </CoordinatorWebContext.Provider>
  );
}

export function useCoordinatorWebChrome() {
  return useContext(CoordinatorWebContext);
}

function renderHeader(header: ListHeader) {
  if (header == null || isValidElement(header)) {
    return header;
  }
  return createElement(header);
}

export function useCoordinatorWebListHeader(header: ListHeader) {
  const chrome = useCoordinatorWebChrome();
  return useMemo(() => {
    if (chrome == null) {
      return header;
    }
    return function CoordinatorWebListHeader() {
      return (
        <>
          {chrome}
          {renderHeader(header)}
        </>
      );
    };
  }, [chrome, header]);
}
