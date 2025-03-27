type MethodCall = {
    thisArg: any;
    functionObject: (...args: any[]) => any;
};

export function callMethod(thisArg: any, methodPath: string, params: any[]): any {
    const methodCall: MethodCall = methodPath.split(".").reduce(
        (acc, key, index, array) => {
            if (!acc) {
                return acc;
            }

            if (!acc.thisArg) {
                return null;
            }

            const objectForKey = acc.thisArg[key];
            if (!objectForKey) {
                return null;
            }

            if (index === array.length - 1) {
                if (typeof objectForKey === "function") {
                    return {
                        thisArg: acc.thisArg,
                        functionObject: objectForKey,
                    };
                }

                return null;
            }
            
            return {
                thisArg: objectForKey,
                functionObject: null,
            };
        }, 
        {
            thisArg: thisArg,
            functionObject: null,
        }
    );

    if (!methodCall) {
        throw new Error("Method not found: " + methodPath + " in " + thisArg);
    }

    return methodCall.functionObject.apply(methodCall.thisArg, params);
}