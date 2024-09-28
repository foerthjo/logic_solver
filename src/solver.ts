/*
TODO

add source of information to statements
a source can be:
	"stated on wikipedia"
	"scraped from the website ..."
	"the user said that"
	in the case of deduced statements, the source may be a list, and it should be marked that the statement is not explicitly stated, but implied.

add timestamp to statements when they were stated
	when feeding statements to an LLM, add how old the statement is
 */

function combine(s1:Statement, s2:Statement) : Statement {
	if (!s1) return;
	if (!s2) return;
	if (s2 instanceof Implication) [s1, s2] = [s2, s1];

	if (s1 instanceof Implication && s2 instanceof RelationInstance) {
		let implication: Implication = s1;
		let relationInstance: RelationInstance = s2;
		
		// a(x) => b(x) and a(x): add b(x)
		if (implication.target1 == relationInstance.target && implication.relation1.equals(relationInstance.relation)) {
			return new RelationInstance(relationInstance.subject, implication.relation2, implication.target2, implication.confidence * relationInstance.confidence);
		}

		// a(x) => b(x) and not b(x): add not a(x)
		if (implication.target2 == relationInstance.target && implication.relation2.equals(relationInstance.relation.inverse())) {
			return new RelationInstance(relationInstance.subject, implication.relation1.inverse(), implication.target1, relationInstance.confidence * implication.confidence);
		}
	}

	if (s1 instanceof RelationInstance && s2 instanceof RelationInstance) {
		if (s1.relation == s2.relation) {
			return new RelationInstance(s1.subject, s1.relation, s2.target, s1.confidence * s2.confidence);
		}
	}

	// TODO combine Implication and Implication

	return null;
}

export class Item {
	name:string;
	constructor(name:string) {
		this.name = name;
	}
}

export class Statement {
	/**
	 * 
	 * @param confidence - How confident the solver should be about the truth of the statement in [0; 1]
	 */
	constructor(public confidence:number) {}

	/**
	 * Combines this statement with a list of statements.
	 * @param statements statements to combine with.
	 * @returns statements deduced by the combination.
	 */
	combine(statements:Statement[]) : Statement[] {
		let res:Statement[] = [];
		statements.forEach(other => {
			let combined = combine(this, other);
			if (combined && !statements.includes(combined)) {
				res.push(combined);
			}
		});
		return res;
	}
}

export class Relation {
	/**
	 * 
	 * @param positive - positive phrase of the relation
	 * @param negative - negative phrase of the relation
	 * @param transitivity - if A is B and B is C, how likely is A also C? (in [0; 1])
	 */
	constructor(public positive: string, public negative: string, public transitivity: number) {}

	inverse() {
		return new Relation(this.negative, this.positive, this.transitivity);
	}

	equals(other: Relation) {
		if (!(other instanceof Relation)) return false;
		return this.positive == other.positive && this.negative == other.negative && this.transitivity == other.transitivity;
	}
}

export class RelationInstance extends Statement {
	constructor(public subject: Item, public relation: Relation, public target: Item, confidence: number = 1) {
		super(confidence);
	}

	toString() {
		return `${this.subject.name} ${this.relation.positive} ${this.target.name} (${(this.confidence * 100).toFixed(2)}%)`;
	}
}

export class Implication extends Statement {
	constructor(public relation1: Relation, public target1: Item, public relation2: Relation, public target2: Item, confidence: number) {
		super(confidence);
	}

	toString() {
		return `if x ${this.relation1.positive} ${this.target1.name} then x ${this.relation2.positive} ${this.target2.name} (${(this.confidence * 100).toFixed(2)}%)`;
	}
}
